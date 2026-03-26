/**
 * Server-only recall automation (cron).
 * Uses server Supabase and WhatsApp send – do not import from client code.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { RecallService } from '@/services/recall-service'
import { Database } from '@/types/database'

function checkBusinessHours(): boolean {
  const hour = new Date().getHours()
  return hour >= 9 && hour <= 19
}

async function cancelRecall(recallId: string, reason: string, supabase: SupabaseClient) {
  await (supabase as any)
    .from('patient_recalls')
    .update({ status: 'cancelled', notes: reason } as any)
    .eq('id', recallId)
}

async function safeSendRecall(recallId: string, clinicId: string, supabase: SupabaseClient) {
  const db = supabase as any

  const { data: clinic } = await db.from('clinics').select('status').eq('id', clinicId).single()
  if (!clinic || clinic.status !== 'active') {
    console.warn(`Clinic ${clinicId} is not active. Aborting send.`)
    return
  }

  if (!checkBusinessHours()) throw new Error('Outside business hours')

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

export async function processDailyRecalls(clinicId: string, supabase: SupabaseClient) {
  const db = supabase as any
  const MAX_BATCH_SIZE = 50

  const { data: recalls } = await db
    .from('patient_recalls')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('status', 'overdue')
    .lt('attempt_count', 3)
    .limit(MAX_BATCH_SIZE)

  if (!recalls?.length) {
    return { processed: 0, sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0
  for (const recall of recalls) {
    try {
      await safeSendRecall(recall.id, clinicId, supabase)
      sent++
      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      console.error(`Failed to process recall ${recall.id}:`, e)
      failed++
    }
  }
  return { processed: recalls.length, sent, failed }
}
