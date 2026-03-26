/**
 * Razorpay Subscription Management
 * Handles subscription creation, updates, and cancellation via Razorpay API
 */

// @ts-ignore
import Razorpay from 'razorpay'

let _razorpay: InstanceType<typeof Razorpay> | null = null
function getRazorpay() {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required')
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret }) as any
  }
  return _razorpay!
}

// Plan details mapping
export const PLAN_CONFIGS = {
  clinic: {
    monthly: {
      price: 299900, // ₹2,999 in paise
      period: 'monthly' as const,
      interval: 1,
    },
    annual: {
      price: 2879280, // ₹28,792.80 (20% discount) in paise
      period: 'yearly' as const,
      interval: 1,
    },
  },
  hospital: {
    monthly: {
      price: 999900, // ₹9,999 in paise
      period: 'monthly' as const,
      interval: 1,
    },
    annual: {
      price: 9599040, // ₹95,990.40 (20% discount) in paise
      period: 'yearly' as const,
      interval: 1,
    },
  },
} as const

type PlanId = keyof typeof PLAN_CONFIGS
type BillingCycle = keyof typeof PLAN_CONFIGS[PlanId]

interface CreateSubscriptionParams {
  userId: string
  userEmail: string
  planId: PlanId
  billingCycle: BillingCycle
  customerId?: string
}

interface SubscriptionResponse {
  subscriptionId: string
  customerId: string
  planId: string
  status: string
  currentPeriodStart: number
  currentPeriodEnd: number
  shortUrl?: string
}

/**
 * Create or retrieve Razorpay customer
 */
export async function getOrCreateCustomer(userId: string, email: string, name?: string) {
  try {
    // Try to find existing customer by email
    const customers = await getRazorpay().customers.all({
      email,
    } as any)

    if (customers.items && customers.items.length > 0) {
      return customers.items[0].id
    }

    // Create new customer
    const customer = await getRazorpay().customers.create({
      email,
      name: name || 'Aura User',
      notes: {
        userId,
      },
    })

    return customer.id
  } catch (error) {
    console.error('Error creating/finding Razorpay customer:', error)
    throw new Error('Failed to create customer in Razorpay')
  }
}

/**
 * Create Razorpay Plan (one-time setup)
 * This should be run once to create plans in Razorpay dashboard
 */
export async function createRazorpayPlan(
  planId: PlanId,
  billingCycle: BillingCycle
) {
  const config = PLAN_CONFIGS[planId][billingCycle]

  try {
    const plan = await getRazorpay().plans.create({
      period: config.period,
      interval: config.interval,
      item: {
        name: `Aura Recall ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingCycle}`,
        amount: config.price,
        currency: 'INR',
        description: `${planId} plan billed ${billingCycle}`,
      },
      notes: {
        planId,
        billingCycle,
      },
    })

    console.log(`Created Razorpay plan: ${plan.id}`)
    return plan.id
  } catch (error) {
    console.error('Error creating Razorpay plan:', error)
    throw error
  }
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionResponse> {
  const { userId, userEmail, planId, billingCycle, customerId } = params

  try {
    // Get or create customer
    const rzpCustomerId = customerId || (await getOrCreateCustomer(userId, userEmail))

    // Get plan config
    const planConfig = PLAN_CONFIGS[planId][billingCycle]

    // Get Razorpay plan ID from environment variables
    const razorpayPlanId =
      billingCycle === 'monthly'
        ? process.env[`RAZORPAY_PLAN_${planId.toUpperCase()}_MONTHLY`]
        : process.env[`RAZORPAY_PLAN_${planId.toUpperCase()}_ANNUAL`]

    if (!razorpayPlanId) {
      throw new Error(`Razorpay plan ID not configured for ${planId} ${billingCycle}`)
    }

    // Create subscription
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: razorpayPlanId,
      customer_id: rzpCustomerId,
      quantity: 1,
      total_count: billingCycle === 'annual' ? 1 : 12, // 1 year for annual, ongoing for monthly
      customer_notify: 1, // Send email to customer
      notes: {
        userId,
        planId,
        billingCycle,
      },
    } as any)

    return {
      subscriptionId: subscription.id,
      customerId: rzpCustomerId,
      planId: razorpayPlanId,
      status: subscription.status,
      currentPeriodStart: subscription.current_start ?? 0,
      currentPeriodEnd: subscription.current_end ?? 0,
      shortUrl: subscription.short_url,
    }
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error)
    throw new Error('Failed to create subscription')
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
) {
  try {
    if (cancelAtPeriodEnd) {
      // Cancel at end of billing period
      const subscription = await getRazorpay().subscriptions.update(subscriptionId, {
        cancel_at_cycle_end: 1,
      } as any)
      return subscription
    } else {
      // Cancel immediately
      const subscription = await getRazorpay().subscriptions.cancel(subscriptionId)
      return subscription
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Fetch subscription details from Razorpay
 */
export async function fetchSubscription(subscriptionId: string) {
  try {
    const subscription = await getRazorpay().subscriptions.fetch(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw new Error('Failed to fetch subscription')
  }
}

/**
 * Fetch all invoices for a subscription
 */
export async function fetchInvoices(subscriptionId: string) {
  try {
    const invoices = await getRazorpay().invoices.all({
      subscription_id: subscriptionId,
    } as any)
    return invoices.items || []
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

/**
 * Update subscription plan (upgrade/downgrade)
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string
) {
  try {
    // Razorpay doesn't support direct plan changes
    // Strategy: Cancel current, create new subscription with proration
    const currentSub = await fetchSubscription(subscriptionId)
    
    // Cancel current subscription immediately
    await getRazorpay().subscriptions.cancel(subscriptionId)
    
    // Calculate proration credit if applicable
    // (This is simplified - in production you'd calculate exact proration)
    
    // Create new subscription
    const newSubscription = await getRazorpay().subscriptions.create({
      plan_id: newPlanId,
      customer_id: currentSub.customer_id,
      quantity: 1,
      customer_notify: 1,
    } as any)
    
    return newSubscription
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    throw new Error('Failed to update subscription plan')
  }
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  webhookBody: string,
  webhookSignature: string,
  webhookSecret: string
): boolean {
  const crypto = require('crypto')
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex')
  
  return expectedSignature === webhookSignature
}

/**
 * Parse Razorpay webhook event
 */
export function parseWebhookEvent(body: any) {
  const event = body.event
  const payload = body.payload
  
  return {
    event,
    subscriptionId: payload.subscription?.entity?.id,
    paymentId: payload.payment?.entity?.id,
    customerId: payload.subscription?.entity?.customer_id || payload.payment?.entity?.customer_id,
    status: payload.subscription?.entity?.status || payload.payment?.entity?.status,
    amount: payload.payment?.entity?.amount,
    payload,
  }
}
