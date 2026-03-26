export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    appointments_limit: 30,
    features: [
      'Up to 30 appointments/month',
      'Basic appointment management',
      'Patient records',
      'Manual reminders'
    ],
    cta: 'Current Plan'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 1999,
    interval: 'month',
    appointments_limit: 200,
    features: [
      'Up to 200 appointments/month',
      'Automated WhatsApp reminders',
      'Basic campaigns',
      'Deposit collection',
      'Email support'
    ],
    cta: 'Upgrade',
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 4999,
    interval: 'month',
    appointments_limit: -1, // unlimited
    features: [
      'Unlimited appointments',
      'All reminder types',
      'Advanced campaigns',
      'Full analytics',
      'Team members (up to 5)',
      'Priority support'
    ],
    cta: 'Upgrade',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 14999,
    interval: 'month',
    appointments_limit: -1,
    features: [
      'Everything in Professional',
      'Multiple locations',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    cta: 'Contact Sales'
  }
]
