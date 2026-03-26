import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/razorpay/subscriptions'

/**
 * POST /api/subscriptions/webhook
 * Handle Razorpay webhook events for subscription lifecycle
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature and body
    const signature = request.headers.get('x-razorpay-signature')
    const body = await request.text()

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse event
    const eventData = parseWebhookEvent(JSON.parse(body))
    const { event, subscriptionId, paymentId, status, amount } = eventData

    console.log(`Received Razorpay webhook: ${event}`)

    // Initialize Supabase admin client
    const supabase = createClient()

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(supabase, subscriptionId, eventData)
        break

      case 'subscription.charged':
        await handleSubscriptionCharged(supabase, subscriptionId, paymentId, amount)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, subscriptionId)
        break

      case 'subscription.paused':
      case 'subscription.halted':
        await handleSubscriptionPaused(supabase, subscriptionId, event)
        break

      case 'payment.failed':
        await handlePaymentFailed(supabase, subscriptionId, paymentId)
        break

      case 'subscription.completed':
        await handleSubscriptionCompleted(supabase, subscriptionId)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription activated (payment successful)
 */
async function handleSubscriptionActivated(
  supabase: any,
  subscriptionId: string,
  eventData: any
) {
  const { currentPeriodStart, currentPeriodEnd } = eventData.payload.subscription.entity

  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', subscriptionId)
}

/**
 * Handle successful subscription charge
 */
async function handleSubscriptionCharged(
  supabase: any,
  subscriptionId: string,
  paymentId: string,
  amount: number
) {
  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', subscriptionId)
    .single()

  if (!subscription) {
    console.error(`Subscription not found: ${subscriptionId}`)
    return
  }

  // Record payment
  await supabase.from('subscription_payments').insert({
    subscription_id: subscription.id,
    razorpay_payment_id: paymentId,
    amount: amount,
    currency: 'INR',
    status: 'captured',
    paid_at: new Date().toISOString(),
  })

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  console.log(`Payment recorded for subscription: ${subscriptionId}`)
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(
  supabase: any,
  subscriptionId: string
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', subscriptionId)

  console.log(`Subscription cancelled: ${subscriptionId}`)
}

/**
 * Handle subscription paused/halted
 */
async function handleSubscriptionPaused(
  supabase: any,
  subscriptionId: string,
  event: string
) {
  await supabase
    .from('subscriptions')
    .update({
      status: event === 'subscription.paused' ? 'past_due' : 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', subscriptionId)
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(
  supabase: any,
  subscriptionId: string,
  paymentId: string
) {
  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', subscriptionId)
    .single()

  if (!subscription) return

  // Record failed payment
  await supabase.from('subscription_payments').insert({
    subscription_id: subscription.id,
    razorpay_payment_id: paymentId,
    amount: 0,
    currency: 'INR',
    status: 'failed',
  })

  // Update subscription to past_due
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id)

  // TODO: Send email notification to user about failed payment
  console.log(`Payment failed for subscription: ${subscriptionId}`)
}

/**
 * Handle subscription completed (for annual subscriptions)
 */
async function handleSubscriptionCompleted(
  supabase: any,
  subscriptionId: string
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', subscriptionId)

  console.log(`Subscription completed: ${subscriptionId}`)
}
