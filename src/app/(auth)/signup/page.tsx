'use client'

import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/signup-form'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'
import { FREE_TRIAL_DAYS, PRICING_PLANS, normalizePlanId } from '@/lib/billing/plans'
import { useSearchParams } from 'next/navigation'

function SignupPageContent() {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-lg"
    >
      <GlassCard className="p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary transition-colors hover:text-primary/90 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Selected Plan Badge */}
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50/50 p-4 backdrop-blur-sm dark:border-green-800/50 dark:bg-green-900/10">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-green-50">
                  {plan.name} Plan
                </h3>
                <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm shadow-green-200 dark:bg-green-500 dark:shadow-none">
                  {FREE_TRIAL_DAYS}-day trial
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-green-100/70">
                {plan.description}
              </p>
              <p className="mt-1 text-sm font-medium text-green-700 dark:text-green-400">
                {plan.price} after trial
              </p>
            </div>
            <Link
              href="/login?next=/dashboard/billing"
              className="whitespace-nowrap text-sm font-medium text-primary transition-colors hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Change after login
            </Link>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-100/50 p-2 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
              <span className="bg-white px-2 text-muted-foreground dark:bg-black">
                Or continue with
              </span>
            </div>
          </div>

          <SocialAuthButtons />
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  )
}
