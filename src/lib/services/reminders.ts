import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { sendSms, isSmsConfigured } from '@/lib/sms/msg91'
import {
  reminder24hTemplate,
  reminder3hTemplate,
  noShowRecoveryTemplate,
  postVisitTemplate,
} from '@/lib/email/templates'
import { format, parseISO } from 'date-fns'

type ReminderStats = {
  processed: number
  sent: number
  failed: number
  reminders24h: number
  reminders3h: number
  noShowRecovery: number
  postVisitFollowups: number
  emailsSent: number
  smsSent: number
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

/* ─────────────────────────────────────────────────────────────────
   Send via all configured channels: WhatsApp primary,
   SMS if WhatsApp fails, Email in parallel (if patient has email)
───────────────────────────────────────────────────────────────── */
async function sendMultiChannel(params: {
  admin: any
  clinicId: string
  phone: string
  email?: string | null
  whatsappContent: string | any
  smsText: string
  emailSubject: string
  emailHtml: string
  logType: string
  appointmentId: string
  patientId: string
  whatsappMetadata?: any
}): Promise<{ success: boolean; channels: string[] }> {
  const channels: string[] = []
  
  const waMetadata = {
    ...params.whatsappMetadata,
    type: params.logType,
    appointmentId: params.appointmentId,
    patientId: params.patientId,
  }

  // 1. WhatsApp (always primary)
  const wa = await sendWhatsAppMessage(params.clinicId, params.phone, params.whatsappContent, waMetadata)

  if (wa.success) {
    channels.push('whatsapp')
  } else if (isSmsConfigured()) {
    // 2. SMS fallback only when WhatsApp fails
    const sms = await sendSms({ to: params.phone, message: params.smsText })
    if (sms.success) channels.push('sms')
  }

  // 3. Email in parallel (independent of WhatsApp status)
  if (params.email && isEmailConfigured()) {
    const emailResult = await sendEmail({
      to: params.email,
      subject: params.emailSubject,
      html: params.emailHtml,
    })
    if (emailResult.success) channels.push('email')
  }

  return { success: channels.length > 0, channels }
}

/* ─────────────────────────────────────────────────────────────────
   Get clinic info for email templates
───────────────────────────────────────────────────────────────── */
async function getClinicInfo(admin: any, clinicId: string) {
  const { data } = await admin
    .from('clinics')
    .select('name, phone')
    .eq('id', clinicId)
    .single()
  return data as { name: string; phone?: string } | null
}

export async function processScheduledReminders(): Promise<ReminderStats> {
  const admin = createAdminClient() as any
  const stats: ReminderStats = {
    processed: 0, sent: 0, failed: 0,
    reminders24h: 0, reminders3h: 0, noShowRecovery: 0,
    postVisitFollowups: 0, emailsSent: 0, smsSent: 0,
  }

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, clinic_id, patient_id, start_time, status, reminder_48h_sent, reminder_24h_sent, reminder_2h_sent, noshow_followup_sent, patients(full_name, phone, email)')
    .in('status', ['pending', 'confirmed', 'completed', 'no_show'])
    .gte('start_time', new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString())
    .lte('start_time', new Date(Date.now() + 52 * 60 * 60 * 1000).toISOString())

  // Cache clinic info to avoid redundant DB calls
  const clinicCache = new Map<string, { name: string; phone?: string }>()

  for (const appointment of appointments || []) {
    const patient = Array.isArray(appointment.patients) ? appointment.patients[0] : appointment.patients
    const phone = patient?.phone
    if (!phone) continue

    stats.processed++
    const startTime = appointment.start_time as string
    const hours = hoursUntil(startTime)
    const firstName = (patient?.full_name || 'there').split(' ')[0]
    const patientEmail = patient?.email || null

    // Lazy-load clinic info
    if (!clinicCache.has(appointment.clinic_id)) {
      const info = await getClinicInfo(admin, appointment.clinic_id)
      if (info) clinicCache.set(appointment.clinic_id, info)
    }
    const clinic = clinicCache.get(appointment.clinic_id)
    const clinicName = clinic?.name ?? 'Your Clinic'
    const clinicPhone = clinic?.phone

    const appointmentDateStr = format(parseISO(startTime), 'EEEE, d MMMM')
    const appointmentTimeStr = format(parseISO(startTime), 'h:mm a')

    const emailData = {
      patientName: patient?.full_name ?? firstName,
      clinicName,
      appointmentDate: appointmentDateStr,
      appointmentTime: appointmentTimeStr,
      clinicPhone,
    }

    /* ── 48h reminder ─────────────────────────────────────────── */
    if (!appointment.reminder_48h_sent && hours <= 50 && hours >= 44) {
      const { subject, html } = reminder24hTemplate({
        ...emailData,
        appointmentDate: `${appointmentDateStr} (in 2 days)`,
      })
      const result = await sendMultiChannel({
        admin,
        clinicId: appointment.clinic_id,
        phone,
        email: patientEmail,
        whatsappContent: `Hi ${firstName}, just a heads-up — your appointment at ${clinicName} is in 2 days on ${appointmentDateStr} at ${appointmentTimeStr}. Reply to reschedule if needed.`,
        smsText: `Hi ${firstName}, appointment at ${clinicName} on ${appointmentDateStr} at ${appointmentTimeStr}. Call ${clinicPhone ?? ''} to reschedule.`,
        emailSubject: subject,
        emailHtml: html,
        logType: 'appointment_reminder_48h',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
      })

      if (result.success) {
        stats.sent++
        stats.reminders24h++ // re-use counter
        if (result.channels.includes('email')) stats.emailsSent++
        if (result.channels.includes('sms')) stats.smsSent++
        await admin.from('appointments').update({ reminder_48h_sent: true }).eq('id', appointment.id)
      } else {
        stats.failed++
      }
    }

    /* ── 24h reminder ─────────────────────────────────────────── */
    if (!appointment.reminder_24h_sent && hours <= 26 && hours >= 20) {
      const { subject, html } = reminder24hTemplate(emailData)
      const result = await sendMultiChannel({
        admin,
        clinicId: appointment.clinic_id,
        phone,
        email: patientEmail,
        whatsappContent: {
          type: 'quick_reply',
          header: { type: 'text', text: 'Appointment Confirmation' },
          body: { text: `Hi ${firstName}, your appointment at ${clinicName} is tomorrow at ${appointmentTimeStr}. Will you be coming?` },
          footer: { text: 'Aura Digital Services' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `CONFIRM_APPT_${appointment.id}`, title: 'Confirm ✅' } },
              { type: 'reply', reply: { id: `RESCHEDULE_APPT_${appointment.id}`, title: 'Reschedule 🔄' } }
            ]
          }
        },
        whatsappMetadata: { messageType: 'interactive' },
        smsText: `Hi ${firstName}, reminder: Appointment at ${clinicName} tomorrow at ${appointmentTimeStr}. Call ${clinicPhone ?? ''} to reschedule.`,
        emailSubject: subject,
        emailHtml: html,
        logType: 'appointment_reminder_24h',
        appointmentId: appointment.id,
        patient_id: appointment.patient_id, // Fix typo if any
      } as any)

      if (result.success) {
        stats.sent++
        stats.reminders24h++
        if (result.channels.includes('email')) stats.emailsSent++
        if (result.channels.includes('sms')) stats.smsSent++
        await admin.from('appointments').update({ reminder_24h_sent: true }).eq('id', appointment.id)
      } else {
        stats.failed++
      }
    }

    /* ── 3h reminder ──────────────────────────────────────────── */
    if (!appointment.reminder_2h_sent && hours <= 4 && hours >= 1) {
      const { subject, html } = reminder3hTemplate(emailData)
      const result = await sendMultiChannel({
        admin,
        clinicId: appointment.clinic_id,
        phone,
        email: patientEmail,
        whatsappContent: `Hi ${firstName}, your appointment at ${clinicName} is in a few hours (${appointmentTimeStr}). We are ready for you!`,
        smsText: `Hi ${firstName}, appointment at ${clinicName} at ${appointmentTimeStr} today. Call ${clinicPhone ?? ''} for queries.`,
        emailSubject: subject,
        emailHtml: html,
        logType: 'appointment_reminder_3h',
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
      })

      if (result.success) {
        stats.sent++
        stats.reminders3h++
        if (result.channels.includes('email')) stats.emailsSent++
        if (result.channels.includes('sms')) stats.smsSent++
        await admin.from('appointments').update({ reminder_2h_sent: true }).eq('id', appointment.id)
      } else {
        stats.failed++
      }
    }

    /* ── No-show recovery (cron fallback — immediate send happens in status route) */
    if (appointment.status === 'no_show' && !appointment.noshow_followup_sent) {
      const alreadySent = await wasMessageSent(admin, appointment.id, 'no_show_recovery')
      if (!alreadySent) {
        const { subject, html } = noShowRecoveryTemplate(emailData)
        const result = await sendMultiChannel({
          admin,
          clinicId: appointment.clinic_id,
          phone,
          email: patientEmail,
          whatsappContent: {
            type: 'quick_reply',
            header: { type: 'text', text: 'Recovery' },
            body: { text: `Hi ${firstName}, we missed you today at ${clinicName}. Use the buttons below to reschedule or speak with us.` },
            footer: { text: 'Aura Digital Services' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: `RESCHEDULE_APPT_${appointment.id}`, title: 'Reschedule Now' } },
                { type: 'reply', reply: { id: `CALL_CLINIC_${appointment.id}`, title: 'Call Us 📞' } }
              ]
            }
          },
          whatsappMetadata: { messageType: 'interactive' },
          smsText: `Hi ${firstName}, missed your appointment at ${clinicName}. Call ${clinicPhone ?? ''} to reschedule.`,
          emailSubject: subject,
          emailHtml: html,
          logType: 'no_show_recovery',
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
        } as any)

        if (result.success) {
          stats.sent++
          stats.noShowRecovery++
          if (result.channels.includes('email')) stats.emailsSent++
          if (result.channels.includes('sms')) stats.smsSent++
          await admin.from('appointments').update({ noshow_followup_sent: true }).eq('id', appointment.id)
        } else {
          stats.failed++
        }
      }
    }

    /* ── Post-visit follow-up ─────────────────────────────────── */
    if (appointment.status === 'completed' && hours <= -1 && hours >= -30) {
      const alreadySent = await wasMessageSent(admin, appointment.id, 'post_visit_followup')
      if (!alreadySent) {
        const { subject, html } = postVisitTemplate(emailData)
        const result = await sendMultiChannel({
          admin,
          clinicId: appointment.clinic_id,
          phone,
          email: patientEmail,
          whatsappContent: `Hi ${firstName}, thank you for visiting ${clinicName}. We hope you are feeling well! Feel free to reach out if you have any questions.`,
          smsText: `Hi ${firstName}, thanks for visiting ${clinicName} today. Call ${clinicPhone ?? ''} if you have questions.`,
          emailSubject: subject,
          emailHtml: html,
          logType: 'post_visit_followup',
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
        })

        if (result.success) {
          stats.sent++
          stats.postVisitFollowups++
          if (result.channels.includes('email')) stats.emailsSent++
          if (result.channels.includes('sms')) stats.smsSent++
        } else {
          stats.failed++
        }
      }
    }
  }

  return stats
}
