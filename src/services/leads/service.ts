import { createAdminClient } from '@/lib/supabase/admin'

export async function findLeadByPhone(clinicId: string, phone: string): Promise<{ id: string } | null> {
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('leads')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .limit(1)
    .maybeSingle()

  return data || null
}

export async function createLeadFromInboundMessage(params: {
  clinicId: string
  phone: string
  text: string
}): Promise<{ id: string } | null> {
  const admin = createAdminClient() as any
  const existing = await findLeadByPhone(params.clinicId, params.phone)
  if (existing) return existing

  const { data, error } = await admin
    .from('leads')
    .insert({
      clinic_id: params.clinicId,
      full_name: 'New WhatsApp Lead',
      phone: params.phone,
      source: 'manual',
      status: 'new',
      notes: `Inbound message: ${params.text}`,
    })
    .select('id')
    .single()

  if (error) return null
  return data || null
}

export async function markLeadOptOut(clinicId: string, phone: string): Promise<void> {
  const admin = createAdminClient() as any
  await admin
    .from('leads')
    .update({ is_opted_out: true, next_followup_at: null })
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
}
