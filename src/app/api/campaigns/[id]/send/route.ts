import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startCampaignSend } from '@/lib/campaigns/send-campaign'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const result = await startCampaignSend(params.id)
    return NextResponse.json(result)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
