import { createClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_PLANS } from '@/constants/plans'
import { startOfMonth, endOfMonth } from 'date-fns'
import { normalizePlanId } from '@/lib/billing/plans'

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

export async function createSubscription(clinicId: string, planId: string) {
  // In a real app, this would call Razorpay API to create subscription
  // For now, we mock it by returning a subscription ID
  return {
    id: `sub_${Math.random().toString(36).substring(7)}`,
    plan_id: planId,
    status: 'created'
  }
}

export async function cancelSubscription(clinicId: string) {
  // Call Razorpay API to cancel
  return true
}

export async function handleSubscriptionWebhook(event: RazorpayEvent) {
  const supabase = createClient() as any
  
  // Verify signature first (middleware usually handles this)

  if (event.event === 'subscription.activated') {
    // Update clinic subscription status
    const { payload } = event
    // Find clinic by subscription_id (stored in DB)
    // Update status to 'active'
  }
  
  // Handle other events...
}
