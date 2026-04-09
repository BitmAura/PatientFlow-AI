import { createAdminClient } from '@/lib/supabase/admin'
import { suggestUpcomingSlots } from '@/services/appointments/service'

function normalize(input: string): string {
  return input.trim().toUpperCase()
}

export async function handleIncomingMessage(params: {
  clinicId: string
  fromPhone: string
  content: string
  metadata?: any
}): Promise<void> {
  const text = params.content.trim()
  const upper = normalize(text)

  if (['STOP', 'NO', 'UNSUBSCRIBE'].includes(upper)) {
    const { markLeadOptOut } = await import('@/services/leads/service')
    await markLeadOptOut(params.clinicId, params.fromPhone)
    return
  }

  // 1. Handle Appointment Buttons (Iron-Clad Logic)
  if (upper.startsWith('CONFIRM_APPT_')) {
    const appointmentId = text.split('CONFIRM_APPT_')[1]
    const supabase = createAdminClient() as any
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appointmentId)
    
    // Send confirmation nudge
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, "Great! Your appointment is confirmed. See you soon! ✅")
    return
  }

  if (upper.startsWith('RESCHEDULE_APPT_')) {
    const appointmentId = text.split('RESCHEDULE_APPT_')[1]
    const slots = await suggestUpcomingSlots(params.clinicId)
    
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, `No problem! Here are some open slots:\n\n${slots.join('\n')}\n\nPlease reply with your choice or call us.`)
    return
  }

  // 2. Default Lead Logic (Fallback)
  const { createLeadFromInboundMessage } = await import('@/services/leads/service')
  const lead = await createLeadFromInboundMessage({
    clinicId: params.clinicId,
    phone: params.fromPhone,
    text,
  })

  if (!lead) return

  if (upper.includes('BOOK') || upper.includes('APPOINTMENT')) {
    const slots = await suggestUpcomingSlots(params.clinicId)
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, `Ready to help! Available slots:\n${slots.join('\n')}`)
    return
  }
}
