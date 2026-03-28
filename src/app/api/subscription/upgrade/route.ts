import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRICING_PLANS, normalizePlanId } from '@/lib/billing/plans'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { plan_id } = await request.json()
  const normalizedPlanId = normalizePlanId(plan_id)

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
      subscription_plan_id: normalizedPlanId,
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
      amount: PRICING_PLANS[normalizedPlanId].monthlyPricePaise / 100,
      status: 'paid',
      description: `Upgrade to ${normalizedPlanId} plan`
    })

  await writeAuditLog({
    clinicId: clinic.id,
    userId: user.id,
    action: 'update',
    entityType: 'subscription_plan',
    entityId: newSubId,
    newValues: {
      plan_id: normalizedPlanId,
      status: 'active',
    },
    request,
  })

  return NextResponse.json({ success: true, subscription_id: newSubId })
}
