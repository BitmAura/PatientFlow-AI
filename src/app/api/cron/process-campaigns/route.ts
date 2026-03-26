import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processCampaignBatch } from '@/lib/campaigns/send-campaign'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  // Find active sending campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('status', 'sending')

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ processed_campaigns: 0, messages_sent: 0 })
  }

  let totalSent = 0
  
  // Process each campaign
  for (const campaign of campaigns) {
    try {
      const result = await processCampaignBatch((campaign as any).id)
      totalSent += result.sent
    } catch (error) {
      console.error(`Error processing campaign ${(campaign as any).id}:`, error)
    }
  }

  return NextResponse.json({
    processed_campaigns: campaigns.length,
    messages_sent: totalSent
  })
}