'use client'

import { SignupForm } from '@/components/auth/signup-form'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { FREE_TRIAL_DAYS, PRICING_PLANS, normalizePlanId } from '@/lib/billing/plans'
import { useSearchParams } from 'next/navigation'

export function SignupView() {
  const searchParams = useSearchParams()
  const selectedPlan = normalizePlanId(searchParams.get('plan') || 'starter')

  const planDetails: Record<
    string,
    { name: string; price: string; description: string }
  > = {
    starter: {
      name: PRICING_PLANS.starter.name,
      price: '₹2,999/month',
      description: 'For doctors and small clinics',
    },
    growth: {
      name: PRICING_PLANS.growth.name,
      price: '₹8,999/month',
      description: 'For scaling clinics and multi-doctor practices',
    },
    pro: {
      name: PRICING_PLANS.pro.name,
      price: '₹14,999/month',
      description: 'For multi-location clinics and hospital groups',
    },
  }

  const plan = planDetails[selectedPlan] || planDetails.starter

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          ← Back to home
        </Link>
      </div>
      <GlassCard className="p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={`/login${searchParams?.get('next') ? `?next=${encodeURIComponent(searchParams.get('next') || '')}` : ''}`}
              className="font-medium text-primary transition-colors hover:text-primary/90"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{plan.name} Plan</h3>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {FREE_TRIAL_DAYS}-day trial
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-1 text-sm font-medium text-primary">
                {plan.price} after trial
              </p>
            </div>
            <Link
              href="/login?next=/dashboard/billing"
              className="whitespace-nowrap text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Change after login
            </Link>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-card p-2 text-xs text-foreground/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No credit card required • Full access for {FREE_TRIAL_DAYS} days • Cancel anytime
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <SignupForm selectedPlan={selectedPlan} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>
      </GlassCard>
    </div>
  )
}
