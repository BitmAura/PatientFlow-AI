import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUsage } from '@/lib/services/subscription'

export async function GET(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const usage = await getCurrentUsage(clinic.id)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('razorpay_subscription_id, status')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    ...usage,
    subscription_id: subscription?.razorpay_subscription_id || null,
    status: subscription?.status || usage.status,
  })
}
