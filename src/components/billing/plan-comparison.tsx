'use client'

import * as React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { SUBSCRIPTION_PLANS } from '@/constants/plans'
import { UpgradeDialog } from './upgrade-dialog'
import { useToast } from '@/hooks/use-toast'
import { normalizePlanId } from '@/lib/billing/plans'
import { useQueryClient } from '@tanstack/react-query'

interface PlanComparisonProps {
  currentPlanId: string
  subscriptionStatus?: string // 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'
}

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

export function PlanComparison({ currentPlanId, subscriptionStatus = 'trialing' }: PlanComparisonProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const normalizedCurrentPlanId = normalizePlanId(currentPlanId)
  const isTrial = subscriptionStatus === 'trialing' || subscriptionStatus === 'pending'

  // Only mark as "current" (disabled) when the user is actively paying for this exact plan.
  // Trial users should still be able to click to activate/pay — they haven't paid yet.
  const isPlanCurrent = (planId: string) =>
    planId === normalizedCurrentPlanId && subscriptionStatus === 'active'

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlan(plan)
  }

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return

    // Choose the right endpoint:
    // - Trial / no existing subscription → /subscribe (creates new)
    // - Active subscription switching plan → /upgrade
    const endpoint = isTrial
      ? '/api/subscription/subscribe'
      : '/api/subscription/upgrade'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: selectedPlan.id, billing_cycle: 'monthly' }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || `Server error ${res.status}`)

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    // If Razorpay subscription was created / returned, open in-page checkout
    if (keyId && data.subscription_id) {
      // Close dialog first so Razorpay modal isn't underneath it
      setSelectedPlan(null)

      try {
        await loadRazorpayScript()
        const rzp = new (window as any).Razorpay({
          key: keyId,
          subscription_id: data.subscription_id,
          name: 'PatientFlow AI',
          description: `${selectedPlan.name} Plan — Monthly`,
          image: '/logo.png',
          theme: { color: '#16a34a' },
          handler: () => {
            toast({
              title: 'Payment Successful',
              description: `You are now on the ${selectedPlan.name} plan. Welcome!`,
            })
            queryClient.invalidateQueries({ queryKey: ['subscription'] })
          },
        })
        rzp.on('payment.failed', (response: any) => {
          toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: response?.error?.description || 'Please try again.',
          })
        })
        rzp.open()
        return
      } catch {
        // Razorpay.js failed to load — fall through to shortUrl
      }
    }

    // Fallback: hosted Razorpay page
    if (data.shortUrl) {
      window.location.href = data.shortUrl
      return
    }

    // Plan updated without payment action needed (e.g., upgrade via API)
    toast({ title: 'Plan Updated', description: 'Your subscription has been updated.' })
    queryClient.invalidateQueries({ queryKey: ['subscription'] })
    setSelectedPlan(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const current = isPlanCurrent(plan.id)
          const isPopular = plan.popular

          return (
            <Card key={plan.id} className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary hover:bg-primary/90">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={current ? 'outline' : isPopular ? 'default' : 'secondary'}
                  disabled={current}
                  onClick={() => !current && handleUpgradeClick(plan)}
                >
                  {current
                    ? 'Current Plan'
                    : isTrial
                    ? `Activate ${plan.name}`
                    : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <UpgradeDialog
        open={!!selectedPlan}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
        plan={selectedPlan}
        isTrial={isTrial}
        onConfirm={handleConfirmUpgrade}
      />
    </>
  )
}
