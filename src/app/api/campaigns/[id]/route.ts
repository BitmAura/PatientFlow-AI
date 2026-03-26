import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCampaignStats } from '@/lib/campaigns/send-campaign'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!campaign) return new NextResponse('Campaign not found', { status: 404 })

  const stats = await getCampaignStats(params.id)

  return NextResponse.json({
    ...(campaign as any),
    stats
  })
}