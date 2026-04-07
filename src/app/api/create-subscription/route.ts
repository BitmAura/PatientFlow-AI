import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSubscription as createRazorpaySubscription } from '@/lib/razorpay/subscriptions'

/**
 * POST /api/create-subscription
 * Server-only endpoint to create a Razorpay subscription for a user.
 * SECURITY: requires header `x-create-subscription-secret` matching `CREATE_SUBSCRIPTION_SECRET` env var.
 */
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-create-subscription-secret')
    const expectedSecret = process.env.CREATE_SUBSCRIPTION_SECRET
    if (!expectedSecret || secretHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, user_id: userId, billingCycle = 'monthly' } = body || {}

    if (!userId) return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    if (!plan || !['starter', 'growth', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const admin = createAdminClient() as any

    // Fetch owner email for Razorpay customer creation
    const { data: ownerUser, error: userErr } = await admin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userErr) {
      console.error('create-subscription: error fetching user', userErr)
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 })
    }

    const userEmail = ownerUser?.email
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required to create subscription' }, { status: 400 })
    }

    // Create subscription in Razorpay
    const created = await createRazorpaySubscription({
      userId,
      userEmail,
      planId: plan as any,
      billingCycle: billingCycle as any,
    })

    // Upsert subscription record in Supabase (use admin client)
    const upsertPayload = {
      user_id: userId,
      plan_id: plan,
      status: created.status || 'active',
      billing_cycle: billingCycle,
      razorpay_subscription_id: created.subscriptionId,
      razorpay_customer_id: created.customerId,
      razorpay_plan_id: created.planId,
      current_period_start: created.currentPeriodStart ? new Date(created.currentPeriodStart * 1000).toISOString() : null,
      current_period_end: created.currentPeriodEnd ? new Date(created.currentPeriodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    await admin.from('subscriptions').upsert(upsertPayload, { onConflict: 'user_id' })

    return NextResponse.json({ success: true, subscriptionId: created.subscriptionId, shortUrl: created.shortUrl })
  } catch (error) {
    console.error('POST /api/create-subscription error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
