import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUsage } from '@/lib/services/subscription'

export async function GET(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Clinics are linked via the staff table, not clinics.user_id
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const clinic = { id: staff.clinic_id as string }

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
