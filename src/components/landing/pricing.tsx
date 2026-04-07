'use client'

import { CalendarCheck2, MessageCircleMore, ArrowRight, Zap } from 'lucide-react'
import { TrackedCtaLink } from '@/components/public/tracked-cta-link'
import { PRICING_PLANS, formatPriceInrFromPaise } from '@/lib/billing/plans'

/**
 * Landing Pricing Section
 * 📈 Persona: Revenue Strategist
 * 🎨 Aura Vision (Light Mode) Aesthetic
 */
export function Pricing() {
  const pricingPlans = [
    {
      name: PRICING_PLANS.starter.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise),
      subtitle: '/month',
      description: 'For single-doctor clinics starting WhatsApp automation.',
      features: [
        'Up to 500 conversations/month',
        'WhatsApp auto-replies for inquiries',
        'Dental consultation links + reminders',
        'Basic analytics dashboard',
      ],
      cta: 'Subscribe now',
      featured: false,
    },
    {
      name: PRICING_PLANS.growth.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.growth.monthlyPricePaise),
      subtitle: '/month',
      description: 'For high-intent dental clinics focused on predictable bookings.',
      features: [
        'Up to 2,000 conversations/month',
        'Advanced follow-up sequences',
        'Recall + no-show prevention flows',
        'Conversion and staff performance tracking',
      ],
      cta: 'Subscribe now',
      featured: true,
    },
    {
      name: PRICING_PLANS.pro.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.pro.monthlyPricePaise),
      subtitle: '/month',
      description: 'For multi-doctor and multi-location healthcare groups.',
      features: [
        'Unlimited conversations',
        'Multi-branch automation',
        'Priority onboarding and support',
        'Custom integrations and reporting',
      ],
      cta: 'Subscribe now',
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="bg-white py-14 md:py-20 lg:py-28 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/40">
            <Zap className="h-3 w-3" />
            Simple Transparent Pricing
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Simple Pricing for Every Clinic Stage
          </h2>
          <p className="mt-4 text-base text-slate-500 sm:text-lg dark:text-slate-400">
             Choose Starter, Growth, or Pro based on inquiry volume and branches.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCard({
  name,
  price,
  subtitle,
  description,
  features,
  cta,
  featured,
}: {
  name: string
  price: string
  subtitle: string
  description: string
  features: string[]
  cta: string
  featured: boolean
}) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-emerald-500/10 ${
        featured
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:border-emerald-900/20 dark:from-emerald-950/20 dark:via-slate-900 dark:to-emerald-950/10 scale-105 z-10'
          : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:border-emerald-900/10'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">{name}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      <div className="mb-8 flex items-end gap-1">
        <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{price}</span>
        {subtitle && <span className="pb-1 text-sm font-bold text-slate-400">{subtitle}</span>}
      </div>
      <ul className="mb-10 space-y-4 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            <CalendarCheck2 className="mt-0.5 h-4 w-4 text-emerald-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <TrackedCtaLink
          href="/login?next=/dashboard/billing"
          label={cta}
          location={`homepage_pricing_${name.toLowerCase()}`}
          tone={featured ? 'primary' : 'secondary'}
          className={featured ? 'h-14 w-full bg-emerald-500 text-white hover:bg-emerald-600' : 'h-14 w-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}
        >
          <MessageCircleMore className="mr-2 h-4 w-4" />
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </TrackedCtaLink>
      </div>
    </div>
  )
}
