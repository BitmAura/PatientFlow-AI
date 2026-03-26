import { createClient } from '@/lib/supabase/server'
import { buildAudienceQuery } from '@/lib/campaigns/audience-filter'

export async function createCampaignRecipients(
  campaignId: string,
  clinicId: string,
  campaignType: string,
  audienceFilter: any
): Promise<number> {
  const supabase = createClient() as any
  
  // 1. Get matching patients
  const query = buildAudienceQuery(supabase, clinicId, campaignType, audienceFilter)
  const { data: patients, error } = await query

  if (error || !patients) {
    throw new Error('Failed to fetch audience')
  }

  if (patients.length === 0) return 0

  // 2. Bulk insert recipients
  // Process in chunks to avoid payload limits
  const chunks = []
  const chunkSize = 1000
  
  for (let i = 0; i < patients.length; i += chunkSize) {
    const chunk = patients.slice(i, i + chunkSize).map(p => ({
      campaign_id: campaignId,
      patient_id: p.id,
      status: 'pending',
      created_at: new Date().toISOString()
    }))
    chunks.push(chunk)
  }

  let totalInserted = 0

  for (const chunk of chunks) {
    const { error: insertError } = await supabase
      .from('campaign_recipients')
      .insert(chunk)
    
    if (insertError) {
      console.error('Error inserting recipients chunk:', insertError)
      // Continue or throw? For robustness, we might want to throw to retry
      throw insertError
    }
    totalInserted += chunk.length
  }

  // Update campaign count
  await supabase
    .from('campaigns')
    .update({ recipients_count: totalInserted })
    .eq('id', campaignId)

  return totalInserted
}

export async function updateRecipientStatus(
  recipientId: string,
  status: string,
  metadata?: any
): Promise<void> {
  const supabase = createClient() as any
  await supabase
    .from('campaign_recipients')
    .update({ 
      status, 
      sent_at: status === 'sent' ? new Date().toISOString() : undefined,
      ...metadata
    })
    .eq('id', recipientId)
}

export async function trackCampaignBooking(
  campaignId: string,
  patientId: string,
  appointmentId: string
): Promise<void> {
  const supabase = createClient() as any
  
  // Update recipient record
  await supabase
    .from('campaign_recipients')
    .update({ 
      booked: true, 
      appointment_id: appointmentId,
      booked_at: new Date().toISOString()
    })
    .eq('campaign_id', campaignId)
    .eq('patient_id', patientId)

  // Increment campaign stats
  // We can do this via RPC or just let stats be calculated on fly
}
