import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SUBSCRIPTION_PLANS } from '@/constants/plans'
import { startOfMonth, endOfMonth } from 'date-fns'
import { BillingCycle, normalizePlanId, PricingPlanId } from '@/lib/billing/plans'
import {
  cancelSubscription as cancelRazorpaySubscription,
  createSubscription as createRazorpaySubscription,
  parseWebhookEvent,
} from '@/lib/razorpay/subscriptions'

// Define types locally if needed or import from types/database
type RazorpayEvent = any 

export async function getCurrentUsage(clinicId: string) {
  const supabase = createClient() as any
  
  const now = new Date()
  const start = startOfMonth(now).toISOString()
  const end = endOfMonth(now).toISOString()

  // Resolve owner user from clinic and fetch canonical subscription row.
  const { data: clinic } = await supabase
    .from('clinics')
    .select('user_id')
    .eq('id', clinicId)
    .single()

  const ownerUserId = clinic?.user_id || null

  const { data: subscription } = ownerUserId
    ? await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', ownerUserId)
        .single()
    : { data: null }

  const planId = normalizePlanId(subscription?.plan_id)
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0]

  // Count appointments in current period
  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', start)
    .lte('created_at', end)

  return {
    plan,
    status: subscription?.status || 'trialing',
    usage: count || 0,
    limit: plan.appointments_limit,
    period_start: start,
    period_end: end
  }
}

export async function checkUsageLimit(clinicId: string) {
  const { usage, limit } = await getCurrentUsage(clinicId)
  if (limit === -1) return true // Unlimited
  return usage < limit
}

export async function createSubscription(
  clinicId: string,
  planId: string,
  billingCycle: BillingCycle = 'monthly'
) {
  const admin = createAdminClient() as any
  const normalizedPlanId = normalizePlanId(planId)

  const { data: clinic } = await admin
    .from('clinics')
    .select('user_id')
    .eq('id', clinicId)
    .single()

  if (!clinic?.user_id) {
    throw new Error('Clinic owner not found')
  }

  const ownerUserId = clinic.user_id
  const { data: ownerUser } = await admin
    .from('users')
    .select('email')
    .eq('id', ownerUserId)
    .single()

  if (!ownerUser?.email) {
    throw new Error('Owner email is required to create subscription')
  }

  const { data: existingSubscription } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', ownerUserId)
    .single()

  const created = await createRazorpaySubscription({
    userId: ownerUserId,
    userEmail: ownerUser.email,
    planId: normalizedPlanId as PricingPlanId,
    billingCycle,
    customerId: existingSubscription?.razorpay_customer_id || undefined,
  })

  const upsertPayload = {
    user_id: ownerUserId,
    plan_id: normalizedPlanId,
    status: created.status || 'active',
    billing_cycle: billingCycle,
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

  await admin
    .from('subscriptions')
    .upsert(upsertPayload, { onConflict: 'user_id' })

  return {
    id: created.subscriptionId,
    plan_id: normalizedPlanId,
    status: created.status,
    short_url: created.shortUrl,
  }
}

export async function cancelSubscription(
  clinicId: string,
  cancelAtPeriodEnd: boolean = true
) {
  const admin = createAdminClient() as any

  const { data: clinic } = await admin
    .from('clinics')
    .select('user_id')
    .eq('id', clinicId)
    .single()

  if (!clinic?.user_id) {
    throw new Error('Clinic owner not found')
  }

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', clinic.user_id)
    .single()

  if (!subscription) return false

  if (subscription.razorpay_subscription_id) {
    await cancelRazorpaySubscription(subscription.razorpay_subscription_id, cancelAtPeriodEnd)
  }

  await admin
    .from('subscriptions')
    .update({
      status: cancelAtPeriodEnd ? subscription.status : 'cancelled',
      cancel_at_period_end: cancelAtPeriodEnd,
      cancelled_at: cancelAtPeriodEnd ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', clinic.user_id)

  return true
}

export async function handleSubscriptionWebhook(event: RazorpayEvent) {
  const admin = createAdminClient() as any
  const parsed = parseWebhookEvent(event)
  if (!parsed.subscriptionId) return

  let nextStatus = String(parsed.status || 'active')
  switch (parsed.event) {
    case 'subscription.activated':
    case 'subscription.charged':
      nextStatus = 'active'
      break
    case 'subscription.cancelled':
      nextStatus = 'cancelled'
      break
    case 'subscription.completed':
      nextStatus = 'expired'
      break
    case 'subscription.paused':
    case 'subscription.halted':
    case 'payment.failed':
      nextStatus = 'past_due'
      break
    default:
      break
  }

  await admin
    .from('subscriptions')
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', parsed.subscriptionId)
}
