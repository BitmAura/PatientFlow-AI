import { createClient } from '@/lib/supabase/server'
import { FREE_TRIAL_DAYS, normalizePlanId, type PricingPlanId } from '@/lib/billing/plans'

type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive'

interface SubscriptionRecord {
  id: string
  user_id: string
  plan_id: string
  status: string
  trial_end?: string | null
  current_period_end?: string | null
  billing_cycle?: string | null
  [key: string]: unknown
}

export interface SubscriptionEligibility {
  canSendMessages: boolean
  status: SubscriptionStatus
  planId: PricingPlanId
  trialEndsAt: string | null
  message: string | null
}

function isFutureDate(value?: string | null): boolean {
  if (!value) return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()
}

export function deriveSubscriptionStatus(subscription: SubscriptionRecord | null): SubscriptionStatus {
  if (!subscription) return 'inactive'
  const normalized = subscription.status as SubscriptionStatus
  if (normalized === 'active') return 'active'
  if (normalized === 'trialing') {
    return isFutureDate(subscription.trial_end) ? 'trialing' : 'expired'
  }
  if (normalized === 'past_due' || normalized === 'cancelled' || normalized === 'expired') {
    return normalized
  }
  return 'inactive'
}

export async function getClinicSubscriptionEligibility(clinicId: string): Promise<SubscriptionEligibility> {
  const supabase = createClient() as any

  const { data: ownerStaff } = await supabase
    .from('staff')
    .select('user_id')
    .eq('clinic_id', clinicId)
    .in('role', ['owner', 'admin'])
    .limit(1)
    .maybeSingle()

  const ownerUserId = ownerStaff?.user_id
  if (!ownerUserId) {
    return {
      canSendMessages: false,
      status: 'inactive',
      planId: 'starter',
      trialEndsAt: null,
      message: 'No active billing owner found for this clinic.',
    }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', ownerUserId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sub = (subscription as SubscriptionRecord | null) || null
  const status = deriveSubscriptionStatus(sub)
  const planId = normalizePlanId(sub?.plan_id)

  if (status === 'active' || status === 'trialing') {
    return {
      canSendMessages: true,
      status,
      planId,
      trialEndsAt: (sub?.trial_end as string | null) || null,
      message: null,
    }
  }

  return {
    canSendMessages: false,
    status,
    planId,
    trialEndsAt: (sub?.trial_end as string | null) || null,
    message: 'Messaging is paused because your subscription is inactive. Please upgrade to resume automation.',
  }
}

export function getDefaultTrialEndDate(): string {
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + FREE_TRIAL_DAYS)
  return trialEndDate.toISOString()
}

export async function trackClinicUsage(
  clinicId: string,
  metric: 'campaign_messages' | 'followup_messages' | 'lead_messages',
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createClient() as any
  try {
    await supabase.from('usage_events').insert({
      clinic_id: clinicId,
      metric,
      quantity,
      metadata: metadata ?? {},
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('Usage event tracking failed:', error)
  }
}
