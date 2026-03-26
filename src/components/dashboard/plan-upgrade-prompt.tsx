'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { PRICING_PLANS, type PricingPlanId } from '@/lib/billing/plans'

type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive'

interface DashboardSubscription {
  plan_id?: string | null
  status?: string | null
  trial_end?: string | null
}

function computeStatus(sub: DashboardSubscription | null): SubscriptionStatus {
  if (!sub?.status) return 'inactive'
  if (sub.status === 'trialing') {
    if (!sub.trial_end) return 'expired'
    return new Date(sub.trial_end).getTime() > Date.now() ? 'trialing' : 'expired'
  }
  if (sub.status === 'active') return 'active'
  if (sub.status === 'past_due') return 'past_due'
  if (sub.status === 'cancelled') return 'cancelled'
  if (sub.status === 'expired') return 'expired'
  return 'inactive'
}

export function PlanUpgradePrompt() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<DashboardSubscription | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription((data as DashboardSubscription | null) ?? null)
      setLoading(false)
    }

    fetchSubscription()
  }, [])

  const status = useMemo(() => computeStatus(subscription), [subscription])
  const currentPlan = useMemo(() => {
    const plan = subscription?.plan_id as PricingPlanId | undefined
    return plan && PRICING_PLANS[plan] ? PRICING_PLANS[plan] : PRICING_PLANS.starter
  }, [subscription?.plan_id])

  if (loading || status === 'active') return null

  const isTrial = status === 'trialing'
  const title = isTrial
    ? `Your ${currentPlan.name} trial is running`
    : 'Messaging is restricted until billing is active'
  const body = isTrial
    ? 'Upgrade now to keep WhatsApp automation and recall journeys active after your 7-day trial.'
    : 'Your clinic automation is paused because the subscription is inactive. Upgrade to resume campaign and follow-up messaging.'

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <p className="font-semibold text-amber-900">{title}</p>
            <Badge variant="secondary" className="bg-amber-100 text-amber-900">
              Billing
            </Badge>
          </div>
          <p className="text-sm text-amber-800">{body}</p>
        </div>
        <Link href="/dashboard/billing">
          <Button className="bg-amber-600 hover:bg-amber-700">
            Upgrade Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
