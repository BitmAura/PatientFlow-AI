import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const { data: campaigns, count: totalCampaigns, error: campaignError } = await supabase
    .from('campaigns')
    .select('id', { count: 'exact' })
    .eq('clinic_id', (staff as any).clinic_id)

  if (campaignError) {
    return new NextResponse('Failed to fetch campaign stats', { status: 500 })
  }

  const campaignIds = (campaigns || []).map((campaign: any) => campaign.id)
  if (campaignIds.length === 0) {
    return NextResponse.json({
      total_campaigns: 0,
      messages_sent: 0,
      response_rate: 0,
      bookings_generated: 0,
    })
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from('campaign_recipients')
    .select('status')
    .in('campaign_id', campaignIds)

  if (recipientsError) {
    return new NextResponse('Failed to fetch campaign recipient stats', { status: 500 })
  }

  const safeRecipients = recipients || []
  const messagesSent = safeRecipients.filter((row: any) => row.status !== 'pending').length
  const readCount = safeRecipients.filter((row: any) => row.status === 'read').length
  const responseRate = messagesSent > 0 ? Number(((readCount / messagesSent) * 100).toFixed(1)) : 0

  let bookingsGenerated = 0
  try {
    const { count: campaignBookings } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', (staff as any).clinic_id)
      .eq('source', 'campaign')
    bookingsGenerated = campaignBookings || 0
  } catch {
    bookingsGenerated = 0
  }

  return NextResponse.json({
    total_campaigns: totalCampaigns || 0,
    messages_sent: messagesSent,
    response_rate: responseRate,
    bookings_generated: bookingsGenerated,
  })
}