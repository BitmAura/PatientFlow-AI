import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BillingCycle, normalizePlanId, PricingPlanId } from '@/lib/billing/plans'
import { createSubscription as createRazorpaySubscription } from '@/lib/razorpay/subscriptions'
import { writeAuditLog } from '@/lib/audit/log'

/**
 * Public endpoint: POST /api/subscription/subscribe
 * Creates a Razorpay subscription for the currently-authenticated user
 * - If a subscription record exists and has a `razorpay_subscription_id`, returns it
 * - Otherwise creates a new Razorpay subscription and upserts the subscriptions row
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient() as any
    const admin = createAdminClient() as any

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const body = await request.json().catch(() => ({}))
    const normalizedPlanId = normalizePlanId(body?.plan_id) as PricingPlanId
    const billingCycle: BillingCycle = body?.billing_cycle === 'annual' ? 'annual' : 'monthly'

    // Fetch existing subscription record (if any)
    const { data: existingSubscription, error: subError } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subError && existingSubscription && existingSubscription.razorpay_subscription_id) {
      // Already has a Razorpay subscription
      return NextResponse.json({
        success: true,
        subscription_id: existingSubscription.razorpay_subscription_id,
        message: 'Already subscribed',
      })
    }

    if (!user.email) {
      return NextResponse.json({ error: 'Missing user email for billing' }, { status: 400 })
    }

    // Create Razorpay subscription
    const created = await createRazorpaySubscription({
      userId: user.id,
      userEmail: user.email,
      planId: normalizedPlanId,
      billingCycle,
      customerId: existingSubscription?.razorpay_customer_id || undefined,
    })

    // Upsert subscription record
    const upsertPayload: any = {
      user_id: user.id,
      plan_id: normalizedPlanId,
      billing_cycle: billingCycle,
      status: created.status || 'active',
      razorpay_subscription_id: created.subscriptionId,
      razorpay_customer_id: created.customerId,
      razorpay_plan_id: created.planId,
      current_period_start: created.currentPeriodStart
        ? new Date(created.currentPeriodStart * 1000).toISOString()
        : null,
      current_period_end: created.currentPeriodEnd
        ? new Date(created.currentPeriodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    }

    await admin.from('subscriptions').upsert(upsertPayload, { onConflict: 'user_id' })

    // Audit log
    await writeAuditLog({
      clinicId: null,
      userId: user.id,
      action: 'create',
      entityType: 'subscription_plan',
      entityId: created.subscriptionId,
      newValues: {
        plan_id: normalizedPlanId,
        billing_cycle: billingCycle,
        status: created.status,
        mode: 'subscribe',
      },
      request,
    })

    return NextResponse.json({
      success: true,
      subscription_id: created.subscriptionId,
      shortUrl: created.shortUrl || null,
      requiresAction: Boolean(created.shortUrl),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Subscription subscribe error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
