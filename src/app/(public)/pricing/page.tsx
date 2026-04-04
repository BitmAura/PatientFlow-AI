'use client'

import Link from 'next/link'
import { useTrackCta } from '@/hooks/use-track-cta'
import { Check, Phone, MessageCircle, Calendar, Shield, Zap, Users, BarChart3, Clock, Code2, Sparkles, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FREE_TRIAL_DAYS, PRICING_PLANS, formatPriceInrFromPaise } from '@/lib/billing/plans'
import { cn } from '@/lib/utils/cn'

export default function PricingPage() {
  const trackCta = useTrackCta()
  const plans = [
    {
      name: PRICING_PLANS.starter.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise),
      period: '/mo',
      description: 'For solo doctors and boutique clinics',
      planId: 'starter',
      features: [
        'Up to 500 appointments/mo',
        'Up to 3 doctors',
        'WhatsApp & AI Reminders',
        'Waitlist AI (Auto-Fill)',
        'Price List AI Lookup',
        'Patient Recall Engine',
        'DISHA Data Sovereignty',
      ],
      popular: true
    },
    {
      name: PRICING_PLANS.growth.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.growth.monthlyPricePaise),
      period: '/mo',
      description: 'For growing multi-doctor practices',
      planId: 'growth',
      features: [
        'Up to 2,000 appointments/mo',
        'Up to 10 doctors & staff',
        'Multi-location (Up to 2)',
        'Advanced Recall Automations',
        'Staff Performance Audits',
        'Conversion ROI Analytics',
        'Priority Technical Support',
      ],
      popular: false
    },
    {
      name: PRICING_PLANS.pro.name,
      price: formatPriceInrFromPaise(PRICING_PLANS.pro.monthlyPricePaise),
      period: '/mo',
      description: 'For hospital groups and scale',
      planId: 'pro',
      features: [
        'Unlimited Flow & Doctors',
        'Unlimited Locations',
        'REST API & EMR Sync',
        'Custom Webhook Logic',
        'Enterprise ROI Reporting',
        'Dedicated Success Manager',
        'Priority 24/7 SLA',
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 🚀 Aura Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 py-20 lg:py-32 dark:from-emerald-950/10 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl">
            <Shield className="h-3 w-3" />
            Transparent Clinical Value
          </div>
          <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white leading-tight">
            Plans Built for <br /><span className="text-emerald-500">Pure Revenue</span>
          </h1>
          <p className="text-lg text-slate-500 md:text-xl dark:text-slate-400 max-w-2xl mx-auto">
            Scale your practice with confidence. No hidden fees, no per-message surcharges, just high-performance patient flow.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
             <PricingSignal value="14 Days" label="Full Access Trial" />
             <PricingSignal value="Zero" label="Setup Fees" />
             <PricingSignal value="Infinite" label="Patient Trust" />
          </div>
        </div>
      </section>

      {/* 🧬 Pricing Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative group rounded-[40px] border p-10 transition-all hover:-translate-y-2",
                  plan.popular 
                    ? "bg-white border-emerald-100 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-50 dark:bg-slate-900 dark:border-emerald-800/30" 
                    : "bg-white/50 border-slate-100 shadow-lg dark:bg-slate-900/40 dark:border-slate-800"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20">
                    <Sparkles className="h-3 w-3" />
                    Growth Pick
                  </div>
                )}
                
                <div className="mb-10">
                  <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{plan.name}</h3>
                  <p className="mb-8 text-sm font-bold text-slate-400">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                    <span className="text-lg font-bold text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-12">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/20">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/enroll" onClick={() => trackCta('Start Free Trial', `pricing_plan_${plan.planId}`, '/enroll')}>
                  <Button 
                    className={cn(
                      "w-full h-16 rounded-2xl text-base font-black transition-all active:scale-[0.98]",
                      plan.popular
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600"
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    )}
                  >
                    Start 14-Day Free Trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-50 bg-emerald-50/30 px-6 py-3 text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/10">
               💰 Save 20% on Annual Billing • Dedicated Onboarding Support Available
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Feature Cards */}
      <section className="bg-white py-24 dark:bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Absolute Clinical Infrastructure
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Waitlist AI Recovery"
              description="Proprietary slot-filling engine that recovers high-ticket cancellations automatically."
            />
            <FeatureCard 
              icon={Search}
              title="Price List AI"
              description="Instant WhatsApp procedure lookups matching your clinical pricing."
            />
            <FeatureCard 
              icon={Shield}
              title="Razorpay Integration"
              description="Collect deposits for high-value appointments to eliminate late cancellations."
            />
            <FeatureCard 
              icon={BarChart3}
              title="ROI Analytics"
              description="Track exact INR recovered from automated no-show follow-ups."
            />
            <FeatureCard
              icon={Users}
              title="Patient Flow Control"
              description="Real-time monitoring of patient confirms vs arrivals across branches."
            />
             <FeatureCard
              icon={Code2}
              title="EMR Integration (Pro)"
              description="Deep REST API access to sync with your existing clinical software."
            />
          </div>
        </div>
      </section>

      {/* ❓ FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Common Questions
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <FAQItem 
              question="Is the 14-day trial really free?"
              answer={`Yes. 100% full access to all features on your chosen plan. No credit card required. We want you to see the ROI recovery first.`}
            />
            <FAQItem 
              question="What happens after the trial?"
              answer="We'll send you a 'Morning Intelligence' summary of your trial performance. You can then choose to subscribe or your account will gracefully pause."
            />
            <FAQItem 
              question="Do you charge per message?"
              answer="No. Your WhatsApp automation costs are included in your monthly plan. We don't believe in taxing your communication."
            />
            <FAQItem 
              question="Is my clinical data secure?"
              answer="Absolutely. We are DISHA-compliant and use bank-grade encryption protocols to ensure patient sovereignty at all times."
            />
          </div>
        </div>
      </section>

      {/* 🏁 Final CTA */}
      <section className="py-32 bg-slate-900 text-center relative overflow-hidden dark:bg-slate-950">
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="container mx-auto px-4 relative">
          <h2 className="mb-8 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Start Your Recovery Path.
          </h2>
          <p className="mb-12 text-lg font-bold text-slate-400">
            No credit card. No commitments. Pure patient flow growth.
          </p>
          <Link href="/enroll">
            <Button size="lg" className="h-16 rounded-2xl bg-emerald-500 px-12 text-lg font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98]">
              Begin Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-[32px] border border-slate-50 bg-white p-8 shadow-xl shadow-emerald-500/5 transition hover:-translate-y-1 dark:bg-slate-900 dark:border-emerald-900/10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <h3 className="mb-3 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="group rounded-[32px] border border-emerald-50 bg-white p-10 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-slate-900 dark:border-emerald-900/20">
      <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{question}</h3>
      <p className="text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
    </div>
  )
}

function PricingSignal({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-emerald-50 bg-white/95 p-6 shadow-xl shadow-emerald-500/5 backdrop-blur-xl dark:bg-slate-900 dark:border-emerald-900/20">
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">{label}</p>
    </div>
  )
}
