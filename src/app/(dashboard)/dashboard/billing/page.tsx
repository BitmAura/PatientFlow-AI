'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { FREE_TRIAL_DAYS, PRICING_PLANS, formatPriceInrFromPaise, normalizePlanId, type BillingCycle, type PricingPlanId } from '@/lib/billing/plans'

interface Subscription {
  id: string
  plan_id: string
  status: string
  trial_end?: string | null
  current_period_end?: string | null
  billing_cycle?: string | null
  razorpay_subscription_id: string | null
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      const sub = data as unknown as Subscription
      setSubscription(sub)
      
      // Calculate days left in trial
      if (sub.status === 'trialing' && sub.trial_end) {
        const trialEnd = new Date(sub.trial_end)
        const now = new Date()
        const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        setDaysLeft(Math.max(0, diff))
      }
    }

    setLoading(false)
  }

  async function handleUpgrade(planId: PricingPlanId, billingCycle: BillingCycle = 'monthly') {
    // Redirect to payment flow
    const response = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        billingCycle,
      })
    })

    const data = await response.json()
    
    if (data.shortUrl) {
      // Redirect to Razorpay payment page
      window.location.href = data.shortUrl
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const planKey = normalizePlanId(subscription?.plan_id) as PricingPlanId
  const currentPlan = PRICING_PLANS[planKey] || PRICING_PLANS.starter
  const currentCycle = subscription?.billing_cycle === 'annual' ? 'annual' : 'monthly'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            {subscription?.status === 'trialing' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Trial Active
              </Badge>
            )}
            {subscription?.status === 'active' && (
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan?.name} Plan</h3>
              <p className="text-muted-foreground">
                {formatPriceInrFromPaise(currentCycle === 'annual' ? currentPlan.annualPricePaise : currentPlan.monthlyPricePaise)}/{currentCycle === 'annual' ? 'year' : 'month'}
              </p>
            </div>
            <div className="text-right">
              {subscription?.status === 'trialing' ? (
                <>
                  <div className="text-3xl font-bold text-green-600">{daysLeft}</div>
                  <p className="text-sm text-muted-foreground">days left in trial</p>
                </>
              ) : (
                <Button onClick={() => handleUpgrade(planKey, currentCycle)} size="sm">
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-3">
            {currentPlan?.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Trial Warning */}
          {subscription?.status === 'trialing' && daysLeft <= 3 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Trial ending soon</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your {FREE_TRIAL_DAYS}-day free trial ends in {daysLeft} days. Add payment details to continue automation.
                </p>
                <Button 
                  onClick={() => handleUpgrade(planKey, currentCycle)}
                  className="mt-3 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  Add Payment Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Info */}
      {subscription?.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 1234</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ll be charged {formatPriceInrFromPaise(currentCycle === 'annual' ? currentPlan.annualPricePaise : currentPlan.monthlyPricePaise)} on this date
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              return (
                <div key={plan.id} className={`rounded-lg border p-4 ${isCurrent ? 'border-green-600 bg-green-50/40' : ''}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {isCurrent ? <Badge className="bg-green-600">Current</Badge> : null}
                  </div>
                  <p className="text-2xl font-bold">{formatPriceInrFromPaise(plan.monthlyPricePaise)}</p>
                  <p className="mb-3 text-xs text-muted-foreground">per month</p>
                  <div className="mb-4 space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    onClick={() => handleUpgrade(plan.id, 'monthly')}
                  >
                    {isCurrent ? 'Manage Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
