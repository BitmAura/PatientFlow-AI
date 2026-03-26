import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelCampaignSend } from '@/lib/campaigns/send-campaign'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  try {
    await cancelCampaignSend(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
