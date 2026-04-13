import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { statusUpdateSchema } from '@/lib/validations/appointment'
import { ALLOWED_TRANSITIONS, AppointmentStatus } from '@/constants/appointment-status'
import { writeAuditLog } from '@/lib/audit/log'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { noShowRecoveryTemplate } from '@/lib/email/templates'
import { format, parseISO } from 'date-fns'

export async function PATCH(
  request: Request,
  context: any
) {
  const body = await request.json()
  const result = statusUpdateSchema.safeParse(body)

  if (!result.success) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  const { status, reason } = result.data
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current appointment with patient + clinic data
  const { data: currentAppt } = await supabase
    .from('appointments')
    .select('status, clinic_id, patient_id, start_time, patients(full_name, phone, email), clinics(name, phone)')
    .eq('id', context.params.id)
    .single()

  if (!currentAppt) return new NextResponse('Appointment not found', { status: 404 })

  // Validate Transition
  const allowed = ALLOWED_TRANSITIONS[(currentAppt as any).status as AppointmentStatus]
  if (!allowed.includes(status as AppointmentStatus)) {
    return new NextResponse(`Cannot transition from ${(currentAppt as any).status} to ${status}`, { status: 400 })
  }

  const previousStatus = (currentAppt as any).status
  const clinicId = (currentAppt as any).clinic_id

  // Update - cast to any to bypass TypeScript strict checking
  const { data, error } = await (supabase as any)
    .from('appointments')
    .update({
      status,
      internal_notes: reason ? `Status changed to ${status}: ${reason}` : undefined,
    })
    .eq('id', context.params.id)
    .select()
    .single()

  if (error) {
    return new NextResponse('Failed to update status', { status: 500 })
  }

  // Update patient lifecycle stage based on new appointment status
  const patientId = (currentAppt as any).patient_id
  if (status === AppointmentStatus.COMPLETED) {
    const admin = createAdminClient() as any
    await admin.from('patients')
      .update({ lifecycle_stage: 'treatment_completed' })
      .eq('id', patientId)
  } else if (status === AppointmentStatus.CHECKED_IN) {
    const admin = createAdminClient() as any
    await admin.from('patients')
      .update({ lifecycle_stage: 'visited' })
      .eq('id', patientId)
  }

  await writeAuditLog({
    clinicId,
    userId: user?.id || null,
    action: 'update',
    entityType: 'appointment_status',
    entityId: context.params.id,
    oldValues: { status: previousStatus },
    newValues: { status, reason: reason || null },
    request,
  })

  // ── Immediate no-show: fire WhatsApp + email right away, don't wait for cron ──
  if (status === AppointmentStatus.NO_SHOW) {
    const appt = currentAppt as any
    const patient = Array.isArray(appt.patients) ? appt.patients[0] : appt.patients
    const clinic = Array.isArray(appt.clinics) ? appt.clinics[0] : appt.clinics
    const phone = patient?.phone
    const patientName = patient?.full_name || 'there'
    const firstName = patientName.split(' ')[0]
    const clinicName = clinic?.name || 'our clinic'
    const clinicPhone = clinic?.phone

    // Fire-and-forget: don't block the response
    if (phone) {
      const waMsg = `Hi ${firstName}, we missed you at ${clinicName} today 💙 Would you like to reschedule? Reply with your preferred time and we'll sort it out for you!`
      sendWhatsAppMessage(
        clinicId,
        phone,
        waMsg,
        { type: 'no_show_recovery', appointmentId: context.params.id, patientId: appt.patient_id }
      ).catch((e: any) => console.error('no-show WhatsApp failed:', e))
    }

    // Email fallback
    const patientEmail = patient?.email
    if (patientEmail && isEmailConfigured()) {
      const startTime = appt.start_time as string
      const emailData = {
        patientName,
        clinicName,
        appointmentDate: format(parseISO(startTime), 'EEEE, d MMMM'),
        appointmentTime: format(parseISO(startTime), 'h:mm a'),
        clinicPhone,
      }
      const { subject, html } = noShowRecoveryTemplate(emailData)
      sendEmail({ to: patientEmail, subject, html })
        .catch((e: any) => console.error('no-show email failed:', e))
    }

    // Seed a recall record immediately so it appears in the recall dashboard
    try {
      const admin = createAdminClient() as any
      const { data: existing } = await admin
        .from('patient_recalls')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('patient_id', (currentAppt as any).patient_id)
        .eq('treatment_category', 'no_show')
        .maybeSingle()

      if (!existing) {
        await admin.from('patient_recalls').insert({
          clinic_id: clinicId,
          patient_id: (currentAppt as any).patient_id,
          treatment_category: 'no_show',
          last_visit_date: (currentAppt as any).start_time,
          recall_due_date: new Date().toISOString(),
          status: 'overdue',
          attempt_count: 1,
          last_contacted_at: new Date().toISOString(),
          notes: `Auto-created from no-show on appointment ${context.params.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
      }
    } catch (e) {
      console.error('Failed to seed no-show recall:', e)
    }
  }

  return NextResponse.json(data)
}
