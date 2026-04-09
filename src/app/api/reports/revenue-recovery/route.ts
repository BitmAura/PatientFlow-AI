import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startOfMonth, endOfMonth, subMonths, subQuarters, subYears, format } from 'date-fns'

/**
 * GET /api/reports/revenue-recovery
 *
 * Calculates two revenue streams that PatientFlow directly recovers for the clinic:
 *
 * 1. RECALL REVENUE — patients who were recalled (recall.status = booked/completed)
 *    and booked an appointment after being contacted.
 *
 * 2. NO-SHOW RECOVERY — no-show patients who rebooked within 30 days.
 *
 * Query params:
 *   period — "month" (default) | "quarter" | "year"
 */
export async function GET(req: NextRequest) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!staff) return NextResponse.json({ error: 'Clinic not found' }, { status: 403 })

  const clinicId: string = staff.clinic_id
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'

  const now = new Date()
  let periodStart: Date
  let periodEnd: Date = endOfMonth(now)

  switch (period) {
    case 'quarter':
      periodStart = startOfMonth(subQuarters(now, 1))
      break
    case 'year':
      periodStart = startOfMonth(subYears(now, 1))
      periodEnd = now
      break
    default: // month
      periodStart = startOfMonth(now)
      break
  }

  // Previous period for comparison (same window shifted back)
  const windowMs = periodEnd.getTime() - periodStart.getTime()
  const prevStart = new Date(periodStart.getTime() - windowMs)
  const prevEnd = new Date(periodStart.getTime())

  const admin = createAdminClient() as any

  // ── 1. Recall Revenue ────────────────────────────────────────────────────────
  // Find recalls that were acted on (status = booked or completed) in this period.
  // Then sum the appointment service price for the appointment created after contact.
  const { data: successfulRecalls } = await admin
    .from('patient_recalls')
    .select('id, patient_id, last_contacted_at, treatment_category')
    .eq('clinic_id', clinicId)
    .in('status', ['booked', 'completed'])
    .gte('updated_at', periodStart.toISOString())
    .lte('updated_at', periodEnd.toISOString())

  let recallRevenue = 0
  let recallPatientsReturned = 0
  const recallDetails: Array<{
    patient_id: string
    treatment_category: string
    contacted_at: string
    appointment_date: string
    service_name: string
    service_price: number
  }> = []

  for (const recall of successfulRecalls ?? []) {
    // Find a completed appointment for this patient AFTER they were contacted
    const contactedAt = recall.last_contacted_at ?? recall.updated_at
    const { data: appt } = await admin
      .from('appointments')
      .select('id, start_time, service_id, services(name, price)')
      .eq('clinic_id', clinicId)
      .eq('patient_id', recall.patient_id)
      .eq('status', 'completed')
      .gte('start_time', contactedAt)
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (appt) {
      const service = Array.isArray(appt.services) ? appt.services[0] : appt.services
      const price = service?.price ?? 0
      recallRevenue += price
      recallPatientsReturned++
      recallDetails.push({
        patient_id: recall.patient_id,
        treatment_category: recall.treatment_category ?? 'General',
        contacted_at: contactedAt,
        appointment_date: appt.start_time,
        service_name: service?.name ?? 'Service',
        service_price: price,
      })
    }
  }

  // ── 2. No-Show Recovery Revenue ─────────────────────────────────────────────
  // No-shows in this period where the same patient booked and completed a new appointment within 30 days.
  const { data: noShows } = await admin
    .from('appointments')
    .select('id, patient_id, start_time, service_id, services(name, price)')
    .eq('clinic_id', clinicId)
    .eq('status', 'no_show')
    .gte('start_time', periodStart.toISOString())
    .lte('start_time', periodEnd.toISOString())

  let noshowRecoveryRevenue = 0
  let noshowsRecovered = 0
  const noshowDetails: Array<{
    patient_id: string
    noshow_date: string
    rebooked_date: string
    service_name: string
    service_price: number
  }> = []

  for (const ns of noShows ?? []) {
    const thirtyDaysAfter = new Date(new Date(ns.start_time).getTime() + 30 * 24 * 60 * 60 * 1000)
    const { data: rebound } = await admin
      .from('appointments')
      .select('id, start_time, service_id, services(name, price)')
      .eq('clinic_id', clinicId)
      .eq('patient_id', ns.patient_id)
      .eq('status', 'completed')
      .gt('start_time', ns.start_time)
      .lte('start_time', thirtyDaysAfter.toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (rebound) {
      const service = Array.isArray(rebound.services) ? rebound.services[0] : rebound.services
      const price = service?.price ?? 0
      noshowRecoveryRevenue += price
      noshowsRecovered++
      noshowDetails.push({
        patient_id: ns.patient_id,
        noshow_date: ns.start_time,
        rebooked_date: rebound.start_time,
        service_name: service?.name ?? 'Service',
        service_price: price,
      })
    }
  }

  // ── 3. Totals & Recall Stats ─────────────────────────────────────────────────
  const { count: totalRecalls } = await admin
    .from('patient_recalls')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  const { count: totalNoShows } = await admin
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'no_show')
    .gte('start_time', periodStart.toISOString())
    .lte('start_time', periodEnd.toISOString())

  // ── 4. Previous period comparison ───────────────────────────────────────────
  const { data: prevRecalls } = await admin
    .from('patient_recalls')
    .select('id')
    .eq('clinic_id', clinicId)
    .in('status', ['booked', 'completed'])
    .gte('updated_at', prevStart.toISOString())
    .lte('updated_at', prevEnd.toISOString())

  const prevRecallCount = prevRecalls?.length ?? 0
  const recallGrowth = prevRecallCount > 0
    ? Math.round(((recallPatientsReturned - prevRecallCount) / prevRecallCount) * 100)
    : null

  const totalRecovered = recallRevenue + noshowRecoveryRevenue

  return NextResponse.json({
    period,
    period_label: format(periodStart, 'MMM d') + ' – ' + format(periodEnd, 'MMM d, yyyy'),

    summary: {
      total_recovered_revenue: totalRecovered,
      recall_revenue: recallRevenue,
      noshow_recovery_revenue: noshowRecoveryRevenue,
      recall_patients_returned: recallPatientsReturned,
      noshow_patients_recovered: noshowsRecovered,
      total_recalls_sent: totalRecalls ?? 0,
      total_no_shows: totalNoShows ?? 0,
      recall_conversion_rate: totalRecalls
        ? Math.round((recallPatientsReturned / totalRecalls) * 100)
        : 0,
      noshow_recovery_rate: totalNoShows
        ? Math.round((noshowsRecovered / (totalNoShows as number)) * 100)
        : 0,
      recall_growth_vs_prev: recallGrowth,
    },

    recall_details: recallDetails,
    noshow_details: noshowDetails,
  })
}
