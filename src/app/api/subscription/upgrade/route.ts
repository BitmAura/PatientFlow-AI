import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { plan_id, payment_method_id } = await request.json()

  // 1. Get clinic
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  // 2. Interact with Razorpay to update/create subscription
  // Mock logic:
  const newSubId = 'sub_' + Math.random().toString(36).substring(7)
  
  // 3. Update DB
  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan_id: plan_id,
      subscription_id: newSubId,
      subscription_status: 'active'
    })
    .eq('id', clinic.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  // 4. Create Invoice Record (Mock)
  await supabase
    .from('invoices')
    .insert({
      clinic_id: clinic.id,
      amount: plan_id === 'starter' ? 1999 : plan_id === 'professional' ? 4999 : 14999,
      status: 'paid',
      description: `Upgrade to ${plan_id} plan`
    })

  return NextResponse.json({ success: true, subscription_id: newSubId })
}
