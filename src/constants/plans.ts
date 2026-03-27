import { PRICING_PLANS } from '@/lib/billing/plans'

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: PRICING_PLANS.starter.name,
    price: PRICING_PLANS.starter.monthlyPricePaise / 100,
    interval: 'month',
    appointments_limit: PRICING_PLANS.starter.monthlyAppointmentLimit,
    features: PRICING_PLANS.starter.features,
    cta: 'Upgrade',
    popular: false,
  },
  {
    id: 'growth',
    name: PRICING_PLANS.growth.name,
    price: PRICING_PLANS.growth.monthlyPricePaise / 100,
    interval: 'month',
    appointments_limit: PRICING_PLANS.growth.monthlyAppointmentLimit,
    features: PRICING_PLANS.growth.features,
    cta: 'Upgrade',
    popular: true,
  },
  {
    id: 'pro',
    name: PRICING_PLANS.pro.name,
    price: PRICING_PLANS.pro.monthlyPricePaise / 100,
    interval: 'month',
    appointments_limit: PRICING_PLANS.pro.monthlyAppointmentLimit,
    features: PRICING_PLANS.pro.features,
    cta: 'Contact Sales',
    popular: false,
  },
]
