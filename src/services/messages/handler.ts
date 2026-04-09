import { createAdminClient } from '@/lib/supabase/admin'
import { suggestUpcomingSlots } from '@/services/appointments/service'
import { analyzePatientIntent, getSmartResponse } from '@/services/ai/intent-analyzer'

function normalize(input: string): string {
  return input.trim().toUpperCase()
}

export async function handleIncomingMessage(params: {
  clinicId: string
  fromPhone: string
  content: string
  metadata?: any
}): Promise<void> {
  const supabase = createAdminClient() as any
  const text = params.content.trim()
  const upper = normalize(text)

  // 1. Log to Inbox (patient_messages) - For all messages
  await supabase.from('patient_messages').insert({
    clinic_id: params.clinicId,
    phone_number: params.fromPhone,
    content: text,
    direction: 'inbound',
    status: 'unread',
    message_id_external: params.metadata?.externalId
  })

  // 1b. AI Insight Layer - Analyze Sentiment & Urgency
  const intent = await analyzePatientIntent(text)
  
  // Update message with AI metadata for staff visibility
  if (params.metadata?.externalId) {
    await supabase.from('patient_messages')
        .update({ metadata: intent } as any)
        .eq('message_id_external', params.metadata.externalId)
  }

  // 2. Handle STOP / OPT OUT (Global Block)
  if (['STOP', 'OPT OUT', 'UNSUBSCRIBE'].some(opt => upper.includes(opt))) {
    // 2a. Clinic level opt-out
    await supabase.from('patients')
      .update({ opted_out: true })
      .eq('clinic_id', params.clinicId)
      .eq('phone', params.fromPhone)

    // 2b. Global Blacklist (Atomic)
    await supabase.from('global_blacklist')
      .upsert({ phone: params.fromPhone, reason: 'user_requested_stop' })

    // 2c. Lead status update
    await supabase.from('leads')
      .update({ status: 'lost', notes: 'Lead opted out via STOP command' })
      .eq('clinic_id', params.clinicId)
      .eq('phone', params.fromPhone)

    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, "You have been opted out from all communications. ⛔")
    return
  }

  // 2b. AI INTERVENTION: Handle Emergencies & High Frustration
  if (intent.interventionRequired) {
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    const smartReply = getSmartResponse(intent)
    
    // 1. Send the calming AI response
    if (smartReply) {
      await sendWhatsAppMessage(params.clinicId, params.fromPhone, smartReply)
    }

    // 2. Create Staff Task for immediate human takeover
    await supabase.from('staff_tasks').insert({
      clinic_id: params.clinicId,
      task_type: intent.category === 'symptom_emergency' ? 'call_emergency' : 'intervention_needed',
      status: 'pending',
      phone: params.fromPhone,
      notes: `AI Detection: ${intent.summary}`,
      due_at: new Date().toISOString()
    } as any)

    return // Halt further automated bot logic to allow for human takeover
  }

  // 3. Handle Appointment Buttons
  if (upper.startsWith('CONFIRM_APPT_')) {
    const appointmentId = text.split('CONFIRM_APPT_')[1]
    
    // Atomic: Confirm appt + Convert Lead
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appointmentId)
    
    // If there is a lead with this phone, mark as converted
    await supabase.from('leads')
        .update({ status: 'converted', converted_patient_id: (await supabase.from('appointments').select('patient_id').eq('id', appointmentId).single()).data?.patient_id })
        .eq('clinic_id', params.clinicId)
        .eq('phone', params.fromPhone)

    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, "Great! Your appointment is confirmed. See you soon! ✅")
    return
  }

  if (upper.startsWith('CANCEL_APPT_')) {
    const appointmentId = text.split('CANCEL_APPT_')[1]
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId)
    
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, "Your appointment has been cancelled. If you'd like to book a new slot, let us know.")
    
    // TRIGGER: Auto-fill Waiting List
    const { processWaitingList } = await import('@/services/appointments/service')
    await processWaitingList(params.clinicId)
    return
  }

  if (upper.startsWith('RESCHEDULE_APPT_')) {
    const appointmentId = text.split('RESCHEDULE_APPT_')[1]
    await supabase.from('appointments').update({ status: 'reschedule_requested' }).eq('id', appointmentId)
    
    const slots = await suggestUpcomingSlots(params.clinicId)
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, `No problem! Here are some open slots:\n\n${slots.join('\n')}\n\nPlease reply with your choice or call us.`)
    return
  }

  // 4. Default Lead Logic (Fallback for unstructured chat)
  const { createLeadFromInboundMessage } = await import('@/services/leads/service')
  const lead = await createLeadFromInboundMessage({
    clinic_id: params.clinicId,
    phone: params.fromPhone,
    text,
  } as any)

  if (!lead) return

  if (upper.includes('BOOK') || upper.includes('APPOINTMENT')) {
    const slots = await suggestUpcomingSlots(params.clinicId)
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/send-message')
    await sendWhatsAppMessage(params.clinicId, params.fromPhone, `Ready to help! Available slots:\n${slots.join('\n')}`)
    return
  }
}
