import { createClient } from '@/lib/supabase/server'
import { SUBSCRIPTION_PLANS } from '@/constants/plans'
import { startOfMonth, endOfMonth } from 'date-fns'

// Define types locally if needed or import from types/database
type RazorpayEvent = any 

export async function getCurrentUsage(clinicId: string) {
  const supabase = createClient() as any
  
  const now = new Date()
  const start = startOfMonth(now).toISOString()
  const end = endOfMonth(now).toISOString()

  // Get current plan from clinic settings or subscription table
  const { data: clinic } = await supabase
    .from('clinics')
    .select('subscription_plan_id, subscription_status')
    .eq('id', clinicId)
    .single()

  const planId = clinic?.subscription_plan_id || 'free'
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
