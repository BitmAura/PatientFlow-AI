export type PricingPlanId = 'starter' | 'growth' | 'pro'
export type BillingCycle = 'monthly' | 'annual'

export interface PricingPlan {
  id: PricingPlanId
  name: string
  monthlyPricePaise: number
  annualPricePaise: number
  features: string[]
}

export const FREE_TRIAL_DAYS = 7

export const PRICING_PLANS: Record<PricingPlanId, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPricePaise: 149900,
    annualPricePaise: 1439040,
    features: ['Limited automation', 'Basic reminders'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    monthlyPricePaise: 349900,
    annualPricePaise: 3359040,
    features: ['Full WhatsApp automation', 'Recall engine'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPricePaise: 699900,
    annualPricePaise: 6719040,
    features: ['Advanced analytics', 'Priority support'],
  },
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
