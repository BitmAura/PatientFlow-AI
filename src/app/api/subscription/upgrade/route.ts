import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BillingCycle, normalizePlanId, PricingPlanId } from '@/lib/billing/plans'
import {
  createSubscription,
  resolveRazorpayPlanId,
  updateSubscriptionPlan,
} from '@/lib/razorpay/subscriptions'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const admin = createAdminClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await request.json()
  const normalizedPlanId = normalizePlanId(body?.plan_id) as PricingPlanId
  const billingCycle: BillingCycle = body?.billing_cycle === 'annual' ? 'annual' : 'monthly'

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  const { data: existingSubscription, error: subError } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (subError || !existingSubscription) {
    return new NextResponse('Subscription not found', { status: 404 })
  }

  let gatewayResult: any

  if (existingSubscription.razorpay_subscription_id) {
    const targetRazorpayPlanId = resolveRazorpayPlanId(normalizedPlanId, billingCycle)
    gatewayResult = await updateSubscriptionPlan(
      existingSubscription.razorpay_subscription_id,
      targetRazorpayPlanId
    )
  } else {
    if (!user.email) {
      return NextResponse.json({ error: 'Missing user email for billing' }, { status: 400 })
    }

    const created = await createSubscription({
      userId: user.id,
      userEmail: user.email,
      planId: normalizedPlanId,
      billingCycle,
      customerId: existingSubscription.razorpay_customer_id || undefined,
    })

    gatewayResult = {
      id: created.subscriptionId,
      customer_id: created.customerId,
      plan_id: created.planId,
      status: created.status,
      current_start: created.currentPeriodStart,
      current_end: created.currentPeriodEnd,
      short_url: created.shortUrl,
    }
  }

  const nextStatus = String(gatewayResult.status || existingSubscription.status || 'active')
  const currentStart = gatewayResult.current_start
    ? new Date(gatewayResult.current_start * 1000).toISOString()
    : existingSubscription.current_period_start
  const currentEnd = gatewayResult.current_end
    ? new Date(gatewayResult.current_end * 1000).toISOString()
    : existingSubscription.current_period_end

  const { error } = await admin
    .from('subscriptions')
    .update({
      plan_id: normalizedPlanId,
      billing_cycle: billingCycle,
      status: nextStatus,
      razorpay_subscription_id:
        gatewayResult.id || existingSubscription.razorpay_subscription_id || null,
      razorpay_customer_id:
        gatewayResult.customer_id || existingSubscription.razorpay_customer_id || null,
      razorpay_plan_id: gatewayResult.plan_id || existingSubscription.razorpay_plan_id || null,
      current_period_start: currentStart,
      current_period_end: currentEnd,
      cancel_at_period_end: false,
      cancelled_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId: staff?.clinic_id || null,
    userId: user.id,
    action: 'update',
    entityType: 'subscription_plan',
    entityId: gatewayResult.id || null,
    newValues: {
      plan_id: normalizedPlanId,
      billing_cycle: billingCycle,
      status: nextStatus,
      mode: 'upgrade',
    },
    request,
  })

  return NextResponse.json({
    success: true,
    subscription_id: gatewayResult.id || existingSubscription.razorpay_subscription_id,
    shortUrl: gatewayResult.short_url || null,
    requiresAction: Boolean(gatewayResult.short_url),
  })
}
