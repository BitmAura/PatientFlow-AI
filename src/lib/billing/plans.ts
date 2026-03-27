export type PricingPlanId = 'starter' | 'growth' | 'pro'
export type BillingCycle = 'monthly' | 'annual'
export type LegacyPlanId = 'clinic' | 'hospital' | 'professional' | 'enterprise' | 'free'

export interface PricingPlan {
  id: PricingPlanId
  name: string
  monthlyPricePaise: number
  annualPricePaise: number
  monthlyAppointmentLimit: number
  monthlyConversationLimit: number
  maxDoctors: number
  maxLocations: number
  featureFlags: {
    campaigns: boolean
    recalls: boolean
    advancedAnalytics: boolean
    apiAccess: boolean
    prioritySupport: boolean
  }
  features: string[]
}

export const FREE_TRIAL_DAYS = 14

export const PRICING_PLANS: Record<PricingPlanId, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPricePaise: 299900,
    annualPricePaise: 2879040,
    monthlyAppointmentLimit: 500,
    monthlyConversationLimit: 500,
    maxDoctors: 3,
    maxLocations: 1,
    featureFlags: {
      campaigns: false,
      recalls: true,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
    },
    features: [
      'Up to 500 appointments/month',
      'Up to 3 doctors',
      'WhatsApp reminders and confirmations',
      'Online booking page',
      'Patient recall workflows',
      'Email and chat support',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPricePaise: 899900,
    annualPricePaise: 8639040,
    monthlyAppointmentLimit: 2000,
    monthlyConversationLimit: 2000,
    maxDoctors: 10,
    maxLocations: 2,
    featureFlags: {
      campaigns: true,
      recalls: true,
      advancedAnalytics: true,
      apiAccess: false,
      prioritySupport: false,
    },
    features: [
      'Up to 2,000 appointments/month',
      'Up to 10 doctors',
      'Campaign automation',
      'Advanced recall engine',
      'Conversion and no-show analytics',
      'Priority onboarding support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPricePaise: 1499900,
    annualPricePaise: 14399040,
    monthlyAppointmentLimit: -1,
    monthlyConversationLimit: -1,
    maxDoctors: -1,
    maxLocations: -1,
    featureFlags: {
      campaigns: true,
      recalls: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
    },
    features: [
      'Unlimited appointments and doctors',
      'Multi-location support',
      'API and custom integrations',
      'Enterprise analytics',
      'Priority support and SLA options',
    ],
  },
}

export const LEGACY_PLAN_MAP: Record<LegacyPlanId, PricingPlanId> = {
  clinic: 'starter',
  hospital: 'growth',
  professional: 'growth',
  enterprise: 'pro',
  free: 'starter',
}

export function normalizePlanId(planId: string | null | undefined): PricingPlanId {
  if (!planId) return 'starter'
  if (planId === 'starter' || planId === 'growth' || planId === 'pro') return planId
  if (planId in LEGACY_PLAN_MAP) {
    return LEGACY_PLAN_MAP[planId as LegacyPlanId]
  }
  return 'starter'
}

export function getPlanPrice(planId: PricingPlanId, billingCycle: BillingCycle): number {
  const plan = PRICING_PLANS[planId]
  return billingCycle === 'annual' ? plan.annualPricePaise : plan.monthlyPricePaise
}

export function formatPriceInrFromPaise(amountPaise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountPaise / 100)
}
