import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelCampaignSend } from '@/lib/campaigns/send-campaign'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(
  request: Request,
  context: any
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, status')
    .eq('id', context.params.id)
    .eq('clinic_id', (staff as any).clinic_id)
    .single()

  if (!campaign) return new NextResponse('Campaign not found', { status: 404 })

  try {
    await cancelCampaignSend(context.params.id)

    await writeAuditLog({
      clinicId: (staff as any).clinic_id,
      userId: user.id,
      action: 'update',
      entityType: 'campaign',
      entityId: context.params.id,
      oldValues: { status: (campaign as any).status },
      newValues: { status: 'cancelled' },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

