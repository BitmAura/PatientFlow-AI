import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

type JourneyStage = 'collect_name' | 'collect_problem' | 'collect_time' | 'booking_confirmed'

interface JourneyContext {
  stage: JourneyStage
  name?: string
  problem?: string
  preferredTime?: string
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function extractName(text: string): string {
  const sanitized = text.replace(/^(my name is|i am|this is)\s+/i, '').trim()
  return toTitleCase(sanitized)
}

function parseContext(notes?: string | null): JourneyContext {
  const defaultContext: JourneyContext = { stage: 'collect_name' }
  if (!notes || !notes.includes('[journey]')) return defaultContext

  const context = { ...defaultContext }
  const pairs = notes
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('[journey]'))

  for (const pair of pairs) {
    const raw = pair.replace('[journey]', '').trim()
    const [key, ...rest] = raw.split('=')
    const value = rest.join('=').trim()
    if (!key || !value) continue
    if (key === 'stage' && ['collect_name', 'collect_problem', 'collect_time', 'booking_confirmed'].includes(value)) {
      context.stage = value as JourneyStage
    }
    if (key === 'name') context.name = value
    if (key === 'problem') context.problem = value
    if (key === 'preferredTime') context.preferredTime = value
  }

  return context
}

function serializeContext(context: JourneyContext, previousNotes?: string | null) {
  const preserved = (previousNotes || '')
    .split('\n')
    .filter(line => !line.trim().startsWith('[journey]'))
    .join('\n')
    .trim()

  const lines = [
    `[journey] stage=${context.stage}`,
    context.name ? `[journey] name=${context.name}` : '',
    context.problem ? `[journey] problem=${context.problem}` : '',
    context.preferredTime ? `[journey] preferredTime=${context.preferredTime}` : '',
  ].filter(Boolean)

  return [preserved, ...lines].filter(Boolean).join('\n')
}

function suggestSlots(preferredTime?: string): string[] {
  if (!preferredTime) {
    return ['Today 6:00 PM', 'Tomorrow 11:30 AM', 'Tomorrow 6:30 PM']
  }
  const lowered = preferredTime.toLowerCase()
  if (lowered.includes('morning')) return ['Tomorrow 10:00 AM', 'Tomorrow 11:30 AM', 'Day after 10:30 AM']
  if (lowered.includes('afternoon')) return ['Today 2:00 PM', 'Tomorrow 1:30 PM', 'Tomorrow 3:00 PM']
  if (lowered.includes('evening') || lowered.includes('night')) return ['Today 6:00 PM', 'Today 7:00 PM', 'Tomorrow 6:30 PM']
  return ['Today 5:30 PM', 'Tomorrow 12:00 PM', 'Tomorrow 6:30 PM']
}

async function logInboundMessage(admin: any, clinicId: string, phone: string, message: string) {
  await admin.from('reminder_logs').insert({
    clinic_id: clinicId,
    phone: normalizePhone(phone),
    message,
    type: 'inbound_whatsapp',
    status: 'received',
    metadata: { direction: 'inbound' },
    created_at: new Date().toISOString(),
  } as any)
}

export async function processIncomingJourneyMessage(
  admin: any,
  clinicId: string,
  fromPhone: string,
  rawMessage: string
) {
  const message = rawMessage.trim()
  if (!message) return

  const phone = normalizePhone(fromPhone)
  await logInboundMessage(admin, clinicId, phone, message)

  const { data: existingLead } = await admin
    .from('leads')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let lead = existingLead
  if (!lead) {
    const { data: created } = await admin
      .from('leads')
      .insert({
        clinic_id: clinicId,
        full_name: 'New WhatsApp Lead',
        phone,
        source: 'whatsapp',
        status: 'new',
        followup_count: 0,
        interest: 'whatsapp_inbound',
        notes: '[journey] stage=collect_name',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    lead = created
    await sendWhatsAppMessage(
      clinicId,
      phone,
      'Hi! Thanks for reaching out to PatientFlow AI. May I know your name?',
      { type: 'journey_new_lead_prompt', leadId: lead?.id }
    )
    return
  }

  const context = parseContext(lead.notes)
  const lowered = message.toLowerCase()
  const wantsBooking =
    lowered.includes('book') || lowered.includes('appointment') || lowered.includes('slot')

  if (context.stage === 'collect_name') {
    context.name = extractName(message)
    context.stage = 'collect_problem'
    await admin
      .from('leads')
      .update({
        full_name: context.name,
        status: 'contacted',
        last_contacted_at: new Date().toISOString(),
        notes: serializeContext(context, lead.notes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    await sendWhatsAppMessage(
      clinicId,
      phone,
      `Nice to meet you, ${context.name}. Please tell me what treatment or concern you are looking for.`,
      { type: 'journey_collect_problem', leadId: lead.id }
    )
    return
  }

  if (context.stage === 'collect_problem') {
    context.problem = message
    context.stage = 'collect_time'
    await admin
      .from('leads')
      .update({
        interest: context.problem,
        notes: serializeContext(context, lead.notes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    await sendWhatsAppMessage(
      clinicId,
      phone,
      'Got it. What time works best for you (morning, afternoon, or evening)?',
      { type: 'journey_collect_time', leadId: lead.id }
    )
    return
  }

  if (context.stage === 'collect_time') {
    context.preferredTime = message
    const slots = suggestSlots(context.preferredTime)
    context.stage = 'booking_confirmed'

    await admin
      .from('leads')
      .update({
        status: 'responsive',
        notes: serializeContext(context, lead.notes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    await sendWhatsAppMessage(
      clinicId,
      phone,
      `Perfect. I can offer these slots:\n1) ${slots[0]}\n2) ${slots[1]}\n3) ${slots[2]}\nReply with 1, 2, or 3 to confirm.`,
      { type: 'journey_slot_suggestions', leadId: lead.id }
    )
    return
  }

  if (context.stage === 'booking_confirmed' && ['1', '2', '3'].includes(message)) {
    const slots = suggestSlots(context.preferredTime)
    const slot = slots[Number(message) - 1]

    await admin
      .from('leads')
      .update({
        status: 'booked',
        next_followup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notes: serializeContext(context, lead.notes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    await sendWhatsAppMessage(
      clinicId,
      phone,
      `Confirmed ${context.name ? context.name + ',' : ''} your appointment request is booked for ${slot}. We will send reminders 24 hours and 3 hours before.`,
      { type: 'journey_booking_confirmed', leadId: lead.id }
    )
    return
  }

  if (wantsBooking) {
    await sendWhatsAppMessage(
      clinicId,
      phone,
      'Happy to help. To book quickly, please share your preferred time (morning/afternoon/evening).',
      { type: 'journey_booking_nudge', leadId: lead.id }
    )
    return
  }

  await sendWhatsAppMessage(
    clinicId,
    phone,
    'Thanks for the update. Our team has noted this and will assist you shortly.',
    { type: 'journey_generic_ack', leadId: lead.id }
  )
}
