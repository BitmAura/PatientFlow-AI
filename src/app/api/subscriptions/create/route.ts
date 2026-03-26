import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription } from '@/lib/razorpay/subscriptions'
import type { PricingPlanId } from '@/lib/billing/plans'

const VALID_PLAN_IDS: PricingPlanId[] = ['starter', 'growth', 'pro']

/**
 * POST /api/subscriptions/create
 * Create a new Razorpay subscription after trial ends
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient() as any
    
    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { planId, billingCycle = 'monthly' } = body

    // Validate plan ID (PatientFlow AI tiers)
    if (!planId || !VALID_PLAN_IDS.includes(planId as PricingPlanId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'No trial subscription found' },
        { status: 404 }
      )
    }

    // Don't allow upgrading if already has Razorpay subscription
    if (existingSubscription.razorpay_subscription_id) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 400 }
      )
    }

    // Create Razorpay subscription
    const razorpaySubscription = await createSubscription({
      userId: user.id,
      userEmail: user.email!,
      planId: planId as PricingPlanId,
      billingCycle: billingCycle as 'monthly' | 'annual',
      customerId: existingSubscription.razorpay_customer_id || undefined,
    })

    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        razorpay_subscription_id: razorpaySubscription.subscriptionId,
        razorpay_customer_id: razorpaySubscription.customerId,
        razorpay_plan_id: razorpaySubscription.planId,
        status: 'active',
        current_period_start: new Date(razorpaySubscription.currentPeriodStart * 1000).toISOString(),
        current_period_end: new Date(razorpaySubscription.currentPeriodEnd * 1000).toISOString(),
        billing_cycle: billingCycle,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      shortUrl: razorpaySubscription.shortUrl,
    })
  } catch (error) {
    console.error('Error in create subscription API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
