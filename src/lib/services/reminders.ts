import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

type ReminderStats = {
  processed: number
  sent: number
  failed: number
  reminders24h: number
  reminders3h: number
  noShowRecovery: number
  postVisitFollowups: number
}

function hoursUntil(dateIso: string) {
  return (new Date(dateIso).getTime() - Date.now()) / (1000 * 60 * 60)
}

async function wasMessageSent(admin: any, appointmentId: string, type: string) {
  const { data } = await admin
    .from('reminder_logs')
    .select('id')
    .eq('appointment_id', appointmentId)
    .eq('type', type)
    .limit(1)
  return Boolean(data && data.length > 0)
}

export async function processScheduledReminders(): Promise<ReminderStats> {
  const admin = createAdminClient() as any
  const stats: ReminderStats = {
    processed: 0,
    sent: 0,
    failed: 0,
    reminders24h: 0,
    reminders3h: 0,
    noShowRecovery: 0,
    postVisitFollowups: 0,
  }

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, clinic_id, patient_id, start_time, status, reminder_sent_24h, reminder_sent_2h, patients(full_name, phone)')
    .in('status', ['pending', 'confirmed', 'completed', 'no_show'])
    .gte('start_time', new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString())
    .lte('start_time', new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString())

  for (const appointment of appointments || []) {
    const patient = Array.isArray(appointment.patients)
      ? appointment.patients[0]
      : appointment.patients
    const phone = patient?.phone
    if (!phone) continue

    stats.processed++
    const startTime = appointment.start_time as string
    const hours = hoursUntil(startTime)
    const firstName = (patient?.full_name || 'there').split(' ')[0]

    if (!appointment.reminder_sent_24h && hours <= 26 && hours >= 20) {
      const result = await sendWhatsAppMessage(
        appointment.clinic_id,
        phone,
        `Hi ${firstName}, reminder from your clinic: your appointment is tomorrow. Reply if you need to reschedule.`,
        {
          type: 'appointment_reminder_24h',
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
        }
      )
      if (result.success) {
        stats.sent++
        stats.reminders24h++
        await admin.from('appointments').update({ reminder_sent_24h: true }).eq('id', appointment.id)
      } else {
        stats.failed++
      }
    }

    if (!appointment.reminder_sent_2h && hours <= 4 && hours >= 1) {
      const result = await sendWhatsAppMessage(
        appointment.clinic_id,
        phone,
        `Hi ${firstName}, quick reminder: your appointment is in a few hours. We are ready for you.`,
        {
          type: 'appointment_reminder_3h',
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
        }
      )
      if (result.success) {
        stats.sent++
        stats.reminders3h++
        await admin.from('appointments').update({ reminder_sent_2h: true }).eq('id', appointment.id)
      } else {
        stats.failed++
      }
    }

    if (appointment.status === 'no_show') {
      const alreadySent = await wasMessageSent(admin, appointment.id, 'no_show_recovery')
      if (!alreadySent) {
        const result = await sendWhatsAppMessage(
          appointment.clinic_id,
          phone,
          `Hi ${firstName}, we missed you today. Want to reschedule? Reply with your preferred time and we will confirm.`,
          {
            type: 'no_show_recovery',
            appointmentId: appointment.id,
            patientId: appointment.patient_id,
          }
        )
        if (result.success) {
          stats.sent++
          stats.noShowRecovery++
        } else {
          stats.failed++
        }
      }
    }

    if (appointment.status === 'completed' && hours <= -2 && hours >= -30) {
      const alreadySent = await wasMessageSent(admin, appointment.id, 'post_visit_followup')
      if (!alreadySent) {
        const result = await sendWhatsAppMessage(
          appointment.clinic_id,
          phone,
          `Hi ${firstName}, thank you for visiting. We'd love your feedback. If your experience was good, please share a quick review.`,
          {
            type: 'post_visit_followup',
            appointmentId: appointment.id,
            patientId: appointment.patient_id,
          }
        )
        if (result.success) {
          stats.sent++
          stats.postVisitFollowups++
        } else {
          stats.failed++
        }
      }
    }
  }

  return stats
}