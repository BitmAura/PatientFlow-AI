import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processCampaignBatch } from '@/lib/campaigns/send-campaign'

export const dynamic = 'force-dynamic'

async function handler(request: NextRequest) {
  // Validate Vercel Cron Secret - REQUIRED, always enforce
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return new NextResponse('Service misconfigured', { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient() as any

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
    messages_sent: totalSent,
  })
}

// Vercel Cron sends GET requests
export const GET = handler
// Allow manual POST triggers (e.g. from admin)
export const POST = handler