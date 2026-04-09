import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionGate } from '@/lib/subscription-gate'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Find the clinic this user belongs to
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!staff?.clinic_id) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  const subData = await SubscriptionGate.getSubscription(supabase, staff.clinic_id)

  if (!subData) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  return NextResponse.json(subData)
}
