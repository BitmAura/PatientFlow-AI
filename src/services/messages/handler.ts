import { triggerAutomation } from '@/services/automation/engine'
import { createLeadFromInboundMessage, markLeadOptOut } from '@/services/leads/service'
import { suggestUpcomingSlots } from '@/services/appointments/service'

function normalize(input: string): string {
  return input.trim().toUpperCase()
}

export async function handleIncomingMessage(params: {
  clinicId: string
  fromPhone: string
  content: string
}): Promise<void> {
  const text = params.content.trim()
  const upper = normalize(text)

  if (['STOP', 'NO', 'UNSUBSCRIBE'].includes(upper)) {
    await markLeadOptOut(params.clinicId, params.fromPhone)
    return
  }

  const lead = await createLeadFromInboundMessage({
    clinicId: params.clinicId,
    phone: params.fromPhone,
    text,
  })

  if (!lead) return

  if (upper.includes('BOOK') || upper.includes('APPOINTMENT')) {
    const slots = await suggestUpcomingSlots(params.clinicId)
    await triggerAutomation({
      type: 'appointment.booked',
      clinicId: params.clinicId,
      phone: params.fromPhone,
      payload: { slots },
    })
    return
  }

  await triggerAutomation({
    type: 'lead.created',
    clinicId: params.clinicId,
    phone: params.fromPhone,
    payload: { leadId: lead.id },
  })
}
