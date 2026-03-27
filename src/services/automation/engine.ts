import { createAdminClient } from '@/lib/supabase/admin'
import { sendMessage } from '@/services/messaging'

type AutomationEventType =
  | 'lead.created'
  | 'appointment.booked'
  | 'appointment.reminder_24h'
  | 'appointment.reminder_3h'
  | 'appointment.no_show'
  | 'patient.recall_due'
  | 'appointment.followup_due'

export interface AutomationEvent {
  type: AutomationEventType
  clinicId: string
  phone: string
  payload?: Record<string, unknown>
}

function resolveTemplate(event: AutomationEvent): string {
  switch (event.type) {
    case 'lead.created':
      return 'Hi! Thanks for contacting us. We can help you book an appointment right away.'
    case 'appointment.booked':
      return 'Your booking is confirmed. Reply if you need to reschedule.'
    case 'appointment.reminder_24h':
      return 'Reminder: Your appointment is in 24 hours.'
    case 'appointment.reminder_3h':
      return 'Reminder: Your appointment is in 3 hours.'
    case 'appointment.no_show':
      return 'We missed you today. Reply to get an instant reschedule slot.'
    case 'patient.recall_due':
      return 'It has been a while since your last visit. Reply to book your recall checkup.'
    case 'appointment.followup_due':
      return 'How was your visit? Reply with feedback and we would appreciate your review.'
    default:
      return 'Thank you for your message.'
  }
}

export async function triggerAutomation(event: AutomationEvent): Promise<void> {
  const admin = createAdminClient() as any
  const message = resolveTemplate(event)
  const result = await sendMessage({
    clinicId: event.clinicId,
    to: event.phone,
    content: message,
    metadata: { event: event.type, ...(event.payload || {}) },
  })

  await admin.from('automation_logs').insert({
    clinic_id: event.clinicId,
    event_type: event.type,
    payload: event.payload || {},
    target_phone: event.phone,
    status: result.success ? 'success' : 'failed',
    error: result.error || null,
    created_at: new Date().toISOString(),
  })
}
