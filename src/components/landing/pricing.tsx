'use client'

import { useState } from 'react'
import { Check, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'
import { PRICING_PLANS, formatPriceInrFromPaise, BillingCycle, PricingPlanId } from '@/lib/billing/plans'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * Landing Pricing Section
 * 📈 Persona: Revenue Strategist
 * 🎨 Premium Multi-tier Grid
 */
export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  const plans = Object.values(PRICING_PLANS)

  async function handleSubscribe(planId: PricingPlanId) {
    setLoading(planId)
    setError(null)
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
    <section id="pricing" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm backdrop-blur-xl dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <Shield className="h-3 w-3" />
            Simple Transparent Pricing
          </div>
          <h2 className="font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white uppercase">
            Built for <span className="text-emerald-600">Pure Recovery</span>
          </h2>
          <p className="mt-4 text-lg font-bold text-slate-500 dark:text-slate-400">
            Scale your practice with confidence. No hidden fees. No per-message taxes.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle((prev: BillingCycle) => prev === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle billing cycle"
              className="relative h-7 w-12 rounded-full bg-slate-200 transition-colors dark:bg-slate-800"
            >
              <div className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-emerald-500 transition-all",
                billingCycle === 'annual' ? "left-6" : "left-1"
              )} />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold", billingCycle === 'annual' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Annual</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Save 20%</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-auto mb-10 max-w-xl rounded-2xl bg-red-50 p-4 text-center text-sm font-black text-red-600 border border-red-100 dark:bg-red-900/20">
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
            <p className="text-sm font-bold text-slate-500">
                Need more than 2,000 monthly appointments? <span className="text-emerald-600 underline cursor-pointer">Contact Enterprise Sales</span>
            </p>
        </div>
      </div>
    </section>
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
  const monthlyLabel = billingCycle === 'monthly' ? '/mo' : '/yr'

  return (
    <div className={cn(
      "group relative flex flex-col rounded-[32px] border p-8 transition-all duration-300",
      isGrowth 
        ? "border-emerald-500 bg-white shadow-2xl shadow-emerald-500/10 z-10 scale-105 dark:bg-slate-900" 
        : "border-slate-200 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 hover:border-emerald-200"
    )}>
      {isGrowth && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3 className="font-heading text-xl font-black text-slate-900 uppercase tracking-tight dark:text-white">{plan.name}</h3>
        <p className="mt-2 text-sm font-bold text-slate-400">
          {isGrowth ? 'Ideal for growing practices' : isPro ? 'Multi-location elite care' : 'Core clinical tools'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 dark:text-white">{displayPrice}</span>
          <span className="text-sm font-bold text-slate-400">{monthlyLabel}</span>
        </div>
        {billingCycle === 'annual' && (
          <p className="mt-1 text-xs font-black text-emerald-500 uppercase">Effective {formatPriceInrFromPaise(price / 12)}/month</p>
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
        {loading ? 'Activating…' : `Start 14-Day Trial`}
      </Button>
    </div>
  )
}
