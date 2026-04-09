'use client'

import { useState } from 'react'
import { CalendarCheck2, MessageCircleMore, ArrowRight, Zap } from 'lucide-react'
import { PRICING_PLANS, formatPriceInrFromPaise } from '@/lib/billing/plans'

/**
 * Landing Pricing Section
 * 📈 Persona: Revenue Strategist
 * 🎨 Aura Vision (Light Mode) Aesthetic
 */
export function Pricing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: 'starter', billing_cycle: 'monthly' }),
      })

      if (res.status === 401) {
        // user not signed in — send to signup with starter preselected
        window.location.href = '/signup?plan=starter'
        return
      }

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = payload?.error || payload?.details || (await res.text().catch(() => res.statusText))
        throw new Error(msg || 'Subscription failed')
      }

      // If Razorpay returned a hosted short URL, open it; otherwise go to billing
      if (payload?.shortUrl) {
        window.open(payload.shortUrl, '_blank')
      } else {
        window.location.href = '/dashboard/billing'
      }
    } catch (err: any) {
      console.error('Subscribe error', err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

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
             Subscribe — starting at {price} / month
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <div className="rounded-3xl border p-8 shadow-xl bg-white dark:bg-slate-900/50">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Subscribe</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Get started with our Starter plan. You can change plans later.</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{price}</span>
              <span className="text-sm font-bold text-slate-400">/month</span>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="inline-flex items-center justify-center h-14 w-full rounded-lg bg-emerald-500 px-6 font-black text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? 'Processing…' : 'Subscribe'}
              </button>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// PricingCard removed — simplified single-CTA pricing per co-founder decision.
