'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTrackCta } from '@/hooks/use-track-cta'
import { Check, Phone, MessageCircle, Calendar, Shield, Zap, Users, BarChart3, Clock, Code2, Sparkles, ArrowRight, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS, formatPriceInrFromPaise, BillingCycle, PricingPlanId } from '@/lib/billing/plans'
import { cn } from '@/lib/utils/cn'

export default function PricingPage() {
  const trackCta = useTrackCta()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  
  const plans = Object.values(PRICING_PLANS)

  async function handleSubscribe(planId: PricingPlanId) {
    setLoading(planId)
    setError(null)
    trackCta('Subscribe', `pricing_subscribe_${planId}`, `/pricing`)
    
    try {
      const res = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
      })

      if (res.status === 401) {
        window.location.href = `/signup?plan=${planId}&cycle=${billingCycle}`
        return
      }

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = payload?.error || (await res.text().catch(() => res.statusText))
        throw new Error(msg || 'Subscription failed')
      }

      if (payload?.shortUrl) window.open(payload.shortUrl, '_blank')
      else window.location.href = '/dashboard/billing'
    } catch (err: any) {
      console.error('Subscribe error', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* 🚀 Aura Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 py-20 lg:py-32 dark:from-emerald-950/10 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/10" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl">
            <Shield className="h-3 w-3" />
            Clinical Revenue Engineering
          </div>
          <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 md:text-7xl dark:text-white leading-tight">
            Plans Built for <br /><span className="text-emerald-500 text-glow-emerald">Pure Recovery</span>
          </h1>
          <p className="text-lg font-bold text-slate-500 md:text-xl dark:text-slate-400 max-w-2xl mx-auto">
            Scale your practice with confidence. No hidden fees, no per-message taxes, just high-performance patient flow.
          </p>

          {/* 🔘 Billing Toggle */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold transition-colors", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle billing cycle"
              className="relative h-9 w-16 rounded-full bg-slate-200 p-1 transition-colors dark:bg-slate-800"
            >
              <div className={cn(
                "h-7 w-7 rounded-full bg-emerald-500 shadow-sm transition-transform duration-200",
                billingCycle === 'annual' ? "translate-x-7" : "translate-x-0"
              )} />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold transition-colors", billingCycle === 'annual' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Annual</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Save 20%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🧬 Pricing Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          {error && (
            <div className="mx-auto mb-12 max-w-xl rounded-2xl bg-red-50 p-4 text-center text-sm font-black text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/40">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <PricingCard 
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                loading={loading === plan.id}
                onSelect={() => handleSubscribe(plan.id)}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-50 bg-emerald-50/30 px-6 py-3 text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/10">
               💰 High-Volume Enterprise Options? <Link href={process.env.NEXT_PUBLIC_WHATSAPP_SALES_URL || "#"} className="underline decoration-emerald-500 decoration-2 underline-offset-4">Talk to an Architect</Link>
            </p>
          </div>
        </div>
      </section>

      {/* 📊 Feature Cards */}
      <section className="bg-white py-24 dark:bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white uppercase">
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
              description="Instant WhatsApp procedure lookups matching your clinical pricing database."
            />
            <FeatureCard 
              icon={Shield}
              title="SECURE SETTLEMENTS"
              description="Collect deposits for high-value appointments to eliminate late cancellations."
            />
            <FeatureCard 
              icon={BarChart3}
              title="ROI ANALYTICS"
              description="Track exact INR recovered from automated no-show follow-ups in real-time."
            />
            <FeatureCard
              icon={Users}
              title="PRO PATIENT FLOW"
              description="Real-time monitoring of patient confirms vs arrivals across all clinic branches."
            />
             <FeatureCard
              icon={Code2}
              title="EMR INTEGRATION"
              description="Deep REST API access to sync with your existing clinical software ecosystem."
            />
          </div>
        </div>
      </section>

      {/* ❓ FAQ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
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
              answer="No. Your WhatsApp automation costs are included in your monthly plan. We don't believe in taxing your communication with patients."
            />
            <FAQItem 
              question="Is my clinical data secure?"
              answer="Absolutely. We are DISHA-compliant and use bank-grade encryption protocols to ensure patient sovereignty at all times."
            />
          </div>
        </div>
      </section>

      {/* 🏁 Final CTA */}
      <section className="py-32 bg-slate-900 text-center relative overflow-hidden dark:bg-slate-950 border-t border-emerald-900/20">
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="container mx-auto px-4 relative">
          <h2 className="mb-8 text-4xl font-black tracking-tight text-white sm:text-6xl uppercase italic">
            Start Your Recovery Path.
          </h2>
          <p className="mb-12 text-lg font-bold text-slate-400">
            No credit card. No commitments. Pure patient flow growth activated.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-16 rounded-2xl bg-emerald-500 px-12 text-lg font-black text-white shadow-3xl shadow-emerald-500/40 hover:bg-emerald-600 transition-all active:scale-[0.98]">
              BEGIN 14-DAY TRIAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function PricingCard({ plan, billingCycle, loading, onSelect }: { 
  plan: any; 
  billingCycle: BillingCycle; 
  loading: boolean; 
  onSelect: () => void 
}) {
  const isGrowth = plan.id === 'growth'
  const isPro = plan.id === 'pro'
  const price = billingCycle === 'monthly' ? plan.monthlyPricePaise : plan.annualPricePaise
  const displayPrice = formatPriceInrFromPaise(price)
  const monthlyEquivalent = billingCycle === 'annual' ? formatPriceInrFromPaise(price / 12) : displayPrice

  return (
    <div className={cn(
      "relative flex flex-col rounded-[32px] border p-8 transition-all duration-300",
      isGrowth 
        ? "border-emerald-500 bg-white shadow-2xl shadow-emerald-500/10 z-10 scale-105 dark:bg-slate-900" 
        : "border-slate-100 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 hover:border-emerald-200"
    )}>
      {isGrowth && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          Most Popular
        </div>
      )}
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white border border-emerald-500/50">
          Enterprise
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight dark:text-white">{plan.name}</h3>
        <p className="mt-2 text-sm font-bold text-slate-400">
          {isGrowth ? 'Ideal for growing practices' : isPro ? 'Multi-location elite care' : 'Core clinical tools'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 dark:text-white">{displayPrice}</span>
          <span className="text-sm font-bold text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        </div>
        {billingCycle === 'annual' && (
          <p className="mt-1 text-xs font-black text-emerald-500 uppercase">Effective {monthlyEquivalent}/month</p>
        )}
      </div>

      <div className="mb-8 flex-1">
        <ul className="space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        onClick={onSelect}
        disabled={loading}
        className={cn(
          "h-14 w-full rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98]",
          isGrowth 
            ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600" 
            : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        )}
      >
        {loading ? 'Activating…' : `Start 14-Day Free Trial`}
      </Button>
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
        <h3 className="mb-3 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="group rounded-[32px] border border-emerald-50 bg-white p-10 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 dark:bg-slate-900 dark:border-emerald-900/20">
      <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{question}</h3>
      <p className="text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">{answer}</p>
    </div>
  )
}
