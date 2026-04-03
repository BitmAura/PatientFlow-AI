/**
 * DISHA Compliance — Patient Data Rights API
 *
 * GET  /api/portal/my-data  → Export all personal data (right to access)
 * DELETE /api/portal/my-data → Request data deletion (right to erasure)
 *
 * Auth: portal session JWT (same as /api/portal/* endpoints)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPortalSession } from '@/lib/portal/session'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient() as any
  const patientId = session.patient_id
  const clinicId = session.clinic_id

  // Fetch all data the clinic holds about this patient
  const [patientRes, appointmentsRes, remindersRes, recallsRes] = await Promise.all([
    admin.from('patients').select('*').eq('id', patientId).eq('clinic_id', clinicId).single(),
    admin.from('appointments').select('id, start_time, end_time, status, notes, service_id, doctor_id, created_at')
      .eq('patient_id', patientId).eq('clinic_id', clinicId).order('start_time', { ascending: false }),
    admin.from('reminder_logs').select('type, status, created_at')
      .eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50),
    admin.from('patient_recalls').select('treatment_category, last_visit_date, recall_due_date, status, created_at')
      .eq('patient_id', patientId).eq('clinic_id', clinicId),
  ])

  // Log the export request
  await admin.from('patient_consent_logs').insert({
    patient_id: patientId,
    clinic_id: clinicId,
    action: 'data_export_requested',
    ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
    user_agent: req.headers.get('user-agent'),
  }).catch(() => { /* non-critical */ })

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    notice: 'This is all personal data held about you by this clinic under DISHA guidelines.',
    patient_profile: patientRes.data ?? null,
    appointments: appointmentsRes.data ?? [],
    reminder_history: remindersRes.data ?? [],
    recalls: recallsRes.data ?? [],
  })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient() as any
  const patientId = session.patient_id
  const clinicId = session.clinic_id

  // Anonymise rather than hard-delete (preserves appointment slot history for clinic ops)
  await admin.from('patients').update({
    full_name: '[Deleted]',
    phone: null,
    email: null,
    notes: null,
    data_deletion_requested_at: new Date().toISOString(),
    consent_given: false,
  }).eq('id', patientId).eq('clinic_id', clinicId)

  // Log deletion request
  await admin.from('patient_consent_logs').insert({
    patient_id: patientId,
    clinic_id: clinicId,
    action: 'data_deletion_requested',
    ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
    user_agent: req.headers.get('user-agent'),
  }).catch(() => { /* non-critical */ })

  return NextResponse.json({
    success: true,
    message: 'Your personal data has been anonymised. Appointment slot history is retained for clinic records only.',
    deleted_at: new Date().toISOString(),
  })
}
