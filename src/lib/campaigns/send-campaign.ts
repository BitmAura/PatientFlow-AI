import { createClient } from '@/lib/supabase/server'
import { createCampaignRecipients } from '@/lib/services/campaign-recipients'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message' // Assuming this exists from previous step
import { buildMessage } from '@/lib/whatsapp/templates'

export async function startCampaignSend(campaignId: string): Promise<{
  success: boolean
  recipients_count: number
}> {
  const supabase = createClient() as any
  
  // 1. Get campaign details
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (!campaign) throw new Error('Campaign not found')
  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    throw new Error('Campaign is not in draft or scheduled state')
  }

  // 2. Create recipients
  const count = await createCampaignRecipients(
    campaign.id,
    campaign.clinic_id,
    campaign.type,
    campaign.audience_filter
  )

  // 3. Update status
  await supabase
    .from('campaigns')
    .update({ 
      status: 'sending',
      recipients_count: count,
      started_at: new Date().toISOString()
    })
    .eq('id', campaignId)

  return { success: true, recipients_count: count }
}

export async function processCampaignBatch(campaignId: string): Promise<{
  sent: number
  failed: number
  remaining: number
}> {
  const supabase = createClient() as any
  const BATCH_SIZE = 50

  // 1. Get campaign and clinic info for connection check
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, clinic:clinics(*)')
    .eq('id', campaignId)
    .single()
    
  if (!campaign) throw new Error('Campaign not found')

  // 2. Get pending recipients
  const { data: recipients } = await supabase
    .from('campaign_recipients')
    .select('*, patient:patients(*)')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .limit(BATCH_SIZE)

  if (!recipients || recipients.length === 0) {
    // Mark completed if no pending left
    const { count } = await supabase
      .from('campaign_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
    
    if (count === 0) {
      await supabase
        .from('campaigns')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', campaignId)
    }
    
    return { sent: 0, failed: 0, remaining: 0 }
  }

  let sent = 0
  let failed = 0

  // 3. Send messages
  for (const recipient of recipients) {
    try {
      // Rate limit delay (simple await)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Build message
      const message = buildMessage(campaign.message_template, {
        patient_name: recipient.patient.full_name,
        patient_first_name: recipient.patient.first_name || recipient.patient.full_name.split(' ')[0],
        clinic_name: campaign.clinic?.name || 'Clinic',
        booking_link: `https://app.aura.me/book/${campaign.clinic_id}` // Mock link
      })

      // Send
      const result = await sendWhatsAppMessage(
        campaign.clinic_id,
        recipient.patient.phone,
        message,
        {
          type: 'campaign',
          campaignId: campaign.id,
          recipientId: recipient.id
        }
      )

      // Update status
      await supabase
        .from('campaign_recipients')
        .update({ 
          status: result.success ? 'sent' : 'failed',
          sent_at: result.success ? new Date().toISOString() : null,
          error_reason: result.error
        })
        .eq('id', recipient.id)

      if (result.success) sent++
      else failed++

    } catch (error) {
      console.error('Error sending to recipient:', recipient.id, error)
      failed++
      await supabase
        .from('campaign_recipients')
        .update({ status: 'failed', error_reason: 'Processing error' })
        .eq('id', recipient.id)
    }
  }

  // Check remaining
  const { count: remaining } = await supabase
    .from('campaign_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')

  return { sent, failed, remaining: remaining || 0 }
}

export async function cancelCampaignSend(campaignId: string): Promise<void> {
  const supabase = createClient() as any
  await supabase
    .from('campaigns')
    .update({ status: 'cancelled' })
    .eq('id', campaignId)
}

export async function getCampaignStats(campaignId: string) {
  const supabase = createClient() as any
  
  // Aggregate stats from recipients table
  // This is expensive for large campaigns, ideally use a materialized view or increment counters
  const { data: recipients } = await supabase
    .from('campaign_recipients')
    .select('status, booked')
    .eq('campaign_id', campaignId)

  const stats = {
    recipients: recipients?.length || 0,
    sent: 0,
    delivered: 0,
    read: 0,
    responded: 0, // Need to implement response tracking logic
    booked: 0
  }

  recipients?.forEach((r: any) => {
    if (r.status === 'sent' || r.status === 'delivered' || r.status === 'read') stats.sent++
    if (r.status === 'delivered' || r.status === 'read') stats.delivered++
    if (r.status === 'read') stats.read++
    if (r.booked) stats.booked++
  })

  return stats
}
