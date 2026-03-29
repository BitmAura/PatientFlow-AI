/**
 * Razorpay Subscription Management
 * Handles subscription creation, updates, and cancellation via Razorpay API
 */

import Razorpay from 'razorpay'
import {
  FREE_TRIAL_DAYS,
  getPlanPrice,
  type BillingCycle,
  type PricingPlanId,
} from '@/lib/billing/plans'
import { getDefaultTrialEndDate } from '@/lib/billing/subscription-guard'

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

interface CreateSubscriptionParams {
  userId: string
  userEmail: string
  planId: PricingPlanId
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

export function resolveRazorpayPlanId(planId: PricingPlanId, billingCycle: BillingCycle): string {
  const cycleKey = billingCycle === 'monthly' ? 'MONTHLY' : 'ANNUAL'
  const primaryKey = `RAZORPAY_PLAN_${planId.toUpperCase()}_${cycleKey}` as const

  if (process.env[primaryKey]) {
    return process.env[primaryKey] as string
  }

  // Backward compatibility with older tier names.
  const legacyPlanId = planId === 'starter' ? 'CLINIC' : planId === 'growth' ? 'HOSPITAL' : 'PRO'
  const legacyKey = `RAZORPAY_PLAN_${legacyPlanId}_${cycleKey}` as const
  const resolved = process.env[legacyKey]
  if (!resolved) {
    throw new Error(`Razorpay plan ID not configured for ${planId} ${billingCycle}`)
  }
  return resolved
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
      name: name || 'PatientFlow AI User',
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
  planId: PricingPlanId,
  billingCycle: BillingCycle
) {
  const price = getPlanPrice(planId, billingCycle)

  try {
    const plan = await getRazorpay().plans.create({
      period: billingCycle === 'annual' ? 'yearly' : 'monthly',
      interval: 1,
      item: {
        name: `PatientFlow AI ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingCycle}`,
        amount: price,
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

    // Get Razorpay plan ID from environment variables
    const razorpayPlanId = resolveRazorpayPlanId(planId, billingCycle)

    // Create subscription
    const subscription = await getRazorpay().subscriptions.create({
      plan_id: razorpayPlanId,
      customer_id: rzpCustomerId,
      quantity: 1,
      total_count: billingCycle === 'annual' ? 1 : 12,
      customer_notify: 1, // Send email to customer
      notes: {
        userId,
        planId,
        billingCycle,
        freeTrialDays: FREE_TRIAL_DAYS,
        trialEndsAt: getDefaultTrialEndDate(),
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
