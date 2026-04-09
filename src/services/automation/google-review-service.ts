import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { subHours, startOfHour, endOfHour } from 'date-fns'

export async function processGoogleReviewNudges() {
  const supabase = createAdminClient() as any
  
  // Find appointments that were completed (visited) 2-4 hours ago
  const targetTime = subHours(new Date(), 2)
  const windowStart = startOfHour(subHours(new Date(), 4)).toISOString()
  const windowEnd = endOfHour(targetTime).toISOString()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      clinic_id,
      patients (full_name, phone, opted_out),
      clinics (name, google_review_url)
    `)
    .eq('status', 'completed')
    .gte('updated_at', windowStart)
    .lte('updated_at', windowEnd)

  if (error || !appointments) return { processed: 0 }

  let sent = 0
  for (const appt of appointments) {
    if (appt.patients?.opted_out || !appt.clinics?.google_review_url) continue

    const message = `Hi ${appt.patients.full_name}, thanks for visiting ${appt.clinics.name} today! We'd love your feedback. Could you leave us a quick Google review? It takes 30 seconds and helps us a lot 🙏\n\n${appt.clinics.google_review_url}`

    const response = await sendWhatsAppMessage(
      appt.clinic_id,
      appt.patients.phone,
      message,
      { type: 'google_review' } as any
    )

    if (response.success) sent++
  }

  return { processed: sent }
}
