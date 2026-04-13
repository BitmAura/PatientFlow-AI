'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Calendar, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import {
  FREE_TRIAL_DAYS,
  PRICING_PLANS,
  formatPriceInrFromPaise,
  normalizePlanId,
  type BillingCycle,
  type PricingPlanId,
} from '@/lib/billing/plans'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader } from '@/components/dashboard/PageStructure'

interface Subscription {
  id: string
  plan_id: string
  status: string
  trial_end?: string | null
  current_period_end?: string | null
  billing_cycle?: string | null
  razorpay_subscription_id: string | null
}

/** Dynamically load the Razorpay checkout script once */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).Razorpay !== 'undefined') { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [daysLeft, setDaysLeft] = useState(0)
  const [upgrading, setUpgrading] = useState<string | null>(null) // plan ID being upgraded
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserEmail(user.email || '')

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      const sub = data as unknown as Subscription
      setSubscription(sub)
      if (sub.status === 'trialing' && sub.trial_end) {
        const diff = Math.ceil(
          (new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
        setDaysLeft(Math.max(0, diff))
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSubscription() }, [fetchSubscription])

  async function handleUpgrade(planId: PricingPlanId, billingCycle: BillingCycle = 'monthly') {
    setError(null)
    setSuccessMsg(null)
    setUpgrading(planId)

    try {
      // Use /subscribe for new subscriptions, /upgrade for plan changes
      const endpoint = subscription?.razorpay_subscription_id
        ? '/api/subscription/upgrade'
        : '/api/subscription/subscribe'

      const body = subscription?.razorpay_subscription_id
        ? { plan_id: planId, billing_cycle: billingCycle }
        : { plan_id: planId, billing_cycle: billingCycle }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Server error ${res.status}`)
      }

      // If Razorpay needs payment action (new subscription or first payment)
      if (data.shortUrl || data.subscription_id) {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

        // Try Razorpay.js in-page checkout first
        if (keyId && (data.subscription_id)) {
          try {
            await loadRazorpayScript()
            const options = {
              key: keyId,
              subscription_id: data.subscription_id,
              name: 'PatientFlow AI',
              description: `${PRICING_PLANS[planId]?.name} Plan — ${billingCycle}`,
              image: '/logo.png',
              prefill: { email: userEmail },
              theme: { color: '#16a34a' },
              handler: () => {
                setSuccessMsg('Payment successful! Your plan is now active.')
                fetchSubscription()
              },
            }
            const rzp = new (window as any).Razorpay(options)
            rzp.on('payment.failed', (response: any) => {
              setError(`Payment failed: ${response.error.description}`)
            })
            rzp.open()
            return
          } catch {
            // Razorpay.js failed to load — fall through to redirect
          }
        }

        // Fallback: redirect to Razorpay hosted page
        if (data.shortUrl) {
          window.location.href = data.shortUrl
          return
        }
      }

      // Plan updated without needing payment (e.g. same-tier change)
      setSuccessMsg('Plan updated successfully.')
      fetchSubscription()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  const planKey = normalizePlanId(subscription?.plan_id) as PricingPlanId
  const currentPlan = PRICING_PLANS[planKey] || PRICING_PLANS.starter
  const currentCycle = subscription?.billing_cycle === 'annual' ? 'annual' : 'monthly'

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Billing & Subscription"
        description="Manage your subscription and billing details"
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Payment failed</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            {subscription?.status === 'trialing' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">Trial Active</Badge>
            )}
            {subscription?.status === 'active' && (
              <Badge className="bg-green-600">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan?.name} Plan</h3>
              <p className="text-muted-foreground">
                {formatPriceInrFromPaise(
                  currentCycle === 'annual'
                    ? currentPlan.annualPricePaise
                    : currentPlan.monthlyPricePaise
                )}/{currentCycle === 'annual' ? 'year' : 'month'}
              </p>
            </div>
            <div className="text-right">
              {subscription?.status === 'trialing' ? (
                <>
                  <div className="text-3xl font-bold text-green-600">{daysLeft}</div>
                  <p className="text-sm text-muted-foreground">days left in trial</p>
                </>
              ) : subscription?.current_period_end ? (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Renews</p>
                  <p className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3">
            {currentPlan?.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Trial Warning */}
          {subscription?.status === 'trialing' && daysLeft <= 7 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Trial ending soon</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your {FREE_TRIAL_DAYS}-day free trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Add payment details to continue.
                </p>
                <Button
                  onClick={() => handleUpgrade(planKey, currentCycle)}
                  disabled={upgrading === planKey}
                  className="mt-3 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  {upgrading === planKey ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</>
                  ) : 'Add Payment Details'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Billing */}
      {subscription?.status === 'active' && subscription.current_period_end && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Next Billing Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ll be charged{' '}
                  {formatPriceInrFromPaise(
                    currentCycle === 'annual'
                      ? currentPlan.annualPricePaise
                      : currentPlan.monthlyPricePaise
                  )}{' '}
                  on this date
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-muted/30">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Managed securely via Razorpay</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment details are stored by Razorpay. We never see your card number.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Upgrade Your Plan
          </CardTitle>
          <CardDescription>Choose Starter, Growth, or Pro based on your clinic needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.values(PRICING_PLANS)).map((plan) => {
              const isCurrent = plan.id === planKey
              const isUpgrading = upgrading === plan.id
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 ${isCurrent ? 'border-green-600 bg-green-50/40' : ''}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {isCurrent ? <Badge className="bg-green-600">Current</Badge> : null}
                  </div>
                  <p className="text-2xl font-bold">{formatPriceInrFromPaise(plan.monthlyPricePaise)}</p>
                  <p className="mb-3 text-xs text-muted-foreground">per month</p>
                  <div className="mb-4 space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent || !!upgrading}
                    onClick={() => !isCurrent && handleUpgrade(plan.id as PricingPlanId, 'monthly')}
                  >
                    {isUpgrading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</>
                    ) : isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
