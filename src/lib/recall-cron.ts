/**
 * Server-only recall automation (cron).
 * Uses server Supabase and WhatsApp send – do not import from client code.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { RecallService } from '@/services/recall-service'
import { Database } from '@/types/database'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function checkBusinessHours(businessHours: any): boolean {
  const now = new Date()
  const fallbackHour = now.getHours()

  if (!businessHours || typeof businessHours !== 'object') {
    return fallbackHour >= 9 && fallbackHour < 19
  }

  const dayName = DAYS[now.getDay()]
  const schedule = businessHours[dayName]
  if (!schedule || schedule.is_off === true || schedule.closed === true) {
    return false
  }

  const start = parseTimeToMinutes(schedule.start || schedule.open)
  const end = parseTimeToMinutes(schedule.end || schedule.close)
  if (start === null || end === null || end <= start) {
    return fallbackHour >= 9 && fallbackHour < 19
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return currentMinutes >= start && currentMinutes < end
}

async function cancelRecall(recallId: string, reason: string, supabase: SupabaseClient) {
  await (supabase as any)
    .from('patient_recalls')
    .update({ status: 'cancelled', notes: reason } as any)
    .eq('id', recallId)
}

async function seedInactivePatientRecalls(clinicId: string, supabase: SupabaseClient) {
  const db = supabase as any
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  const { data: patients } = await db
    .from('patients')
    .select('id, full_name, phone, whatsapp_opt_in, lifecycle_stage')
    .eq('clinic_id', clinicId)
    .eq('whatsapp_opt_in', true)

  for (const patient of patients || []) {
    if (!patient.phone || patient.lifecycle_stage === 'opted_out') continue

    const { data: latestAppointment } = await db
      .from('appointments')
      .select('start_time, status')
      .eq('clinic_id', clinicId)
      .eq('patient_id', patient.id)
      .eq('status', 'completed')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latestAppointment?.start_time) continue
    const daysInactive = Math.floor((now - new Date(latestAppointment.start_time).getTime()) / dayMs)
    const needs30 = daysInactive >= 30
    const needs60 = daysInactive >= 60

    if (!needs30) continue

    const { data: existingRecalls } = await db
      .from('patient_recalls')
      .select('id, treatment_category')
      .eq('clinic_id', clinicId)
      .eq('patient_id', patient.id)
      .in('treatment_category', ['inactive_30', 'inactive_60'])

    const has30 = (existingRecalls || []).some((r: any) => r.treatment_category === 'inactive_30')
    const has60 = (existingRecalls || []).some((r: any) => r.treatment_category === 'inactive_60')

    if (needs30 && !has30) {
      await db.from('patient_recalls').insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        treatment_category: 'inactive_30',
        last_visit_date: latestAppointment.start_time,
        recall_due_date: new Date().toISOString(),
        status: 'overdue',
        attempt_count: 0,
        notes: 'Auto-created: patient inactive for 30 days',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
    }

    if (needs60 && !has60) {
      await db.from('patient_recalls').insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        treatment_category: 'inactive_60',
        last_visit_date: latestAppointment.start_time,
        recall_due_date: new Date().toISOString(),
        status: 'overdue',
        attempt_count: 0,
        notes: 'Auto-created: patient inactive for 60 days',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
    }
  }
}

async function safeSendRecall(recallId: string, clinicId: string, supabase: SupabaseClient) {
  const db = supabase as any

  const { data: clinic } = await db.from('clinics').select('status, business_hours').eq('id', clinicId).single()
  if (!clinic || clinic.status !== 'active') {
    console.warn(`Clinic ${clinicId} is not active. Aborting send.`)
    return
  }

  if (!checkBusinessHours(clinic.business_hours)) throw new Error('Outside business hours')

  const { data: recall } = await db.from('patient_recalls').select('*, patients(*)').eq('id', recallId).single()
  if (!recall) throw new Error('Recall not found')

  if (recall.patients?.lifecycle_stage === 'opted_out') {
    await cancelRecall(recallId, 'Patient opted out', supabase)
    return
  }

  if ((recall.attempt_count ?? 0) >= 3) return

  const firstName = recall.patients?.full_name?.split(' ')[0] || 'Patient'
  const { success, error } = await sendWhatsAppMessage(
    clinicId,
    recall.patients?.phone,
    {
      name: 'recall_offer_v1',
      language: { code: 'en' },
      components: [{ type: 'body', parameters: [{ type: 'text', text: firstName }] }]
    },
    { type: 'recall_automated', patientId: recall.patient_id }
  )

  if (!success) {
    await RecallService.logActivity(recallId, 'message_failed' as Database['public']['Enums']['recall_activity_type'], `Failed to send: ${error}`, supabase)
    return
  }
  await RecallService.logActivity(recallId, 'message_sent', 'Automated safe-send (Template)', supabase)
}

import { calculatePatientScore } from '@/lib/ai/lead-scoring'

export async function processDailyRecalls(clinicId: string, supabase: SupabaseClient) {
  const db = supabase as any
  const MAX_BATCH_SIZE = 50
  await seedInactivePatientRecalls(clinicId, supabase)

  // Fetch recalls order by priority score (Calculated in DB or here)
  // For now we fetch a larger pool and score them in-memory
  const { data: rawRecalls } = await db
    .from('patient_recalls')
    .select('*, patients(*, appointments(status))')
    .eq('clinic_id', clinicId)
    .eq('status', 'overdue')
    .lt('attempt_count', 3)
    .limit(MAX_BATCH_SIZE * 2)

  if (!rawRecalls?.length) {
    return { processed: 0, sent: 0, failed: 0 }
  }

  // AI-Driven Prioritization (Financial weighting)
  const scoredRecalls = rawRecalls.map((recall: any) => {
    const appointments = recall.patients?.appointments || []
    const history = {
      total_appointments: appointments.length,
      no_show_count: appointments.filter((a: any) => a.status === 'no_show').length,
      completed_count: appointments.filter((a: any) => a.status === 'completed').length,
    }
    
    // Pass the treatment_tier (fetched from the patient record if available)
    const score = calculatePatientScore({
      history,
      treatment_category: recall.treatment_category,
      treatment_tier: recall.patients?.treatment_tier || 'tier_3',
      last_visit_date: recall.last_visit_date,
    })
    return { ...recall, ai_score: score }
  }).sort((a: any, b: any) => b.ai_score - a.ai_score)
    .slice(0, MAX_BATCH_SIZE)

  let sent = 0
  let failed = 0
  for (const recall of scoredRecalls) {
    try {
      await safeSendRecall(recall.id, clinicId, supabase)
      sent++
      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      console.error(`Failed to process recall ${recall.id}:`, e)
      failed++
    }
  }
  return { processed: scoredRecalls.length, sent, failed }
}
