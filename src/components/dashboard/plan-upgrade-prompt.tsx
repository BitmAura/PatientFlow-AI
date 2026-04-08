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
    ? `⚠️ Trial ends in ${subscription?.trial_end ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0} days`
    : '🚫 Messaging blocked - subscription required'
  const body = isTrial
    ? 'Your trial is ending soon. Upgrade now to avoid losing WhatsApp automation, patient recalls, and booking confirmations. Clinics lose ₹1,500-5,000 per missed no-show without automation.'
    : 'Your clinic messaging is completely blocked. Patients won\'t receive reminders, recalls, or confirmations. Upgrade immediately to restore full functionality.'

  const urgencyColor = isTrial ? 'amber' : 'red'
  const bgColor = isTrial ? 'bg-amber-50/40 border-amber-200' : 'bg-red-50/40 border-red-200'
  const textColor = isTrial ? 'text-amber-900' : 'text-red-900'
  const buttonColor = isTrial ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'

  return (
    <Card className={`${bgColor} border-2 animate-pulse`}>
      <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 text-${urgencyColor}-700`} />
            <p className={`font-bold text-lg ${textColor}`}>{title}</p>
            <Badge variant="destructive" className={`bg-${urgencyColor}-100 text-${urgencyColor}-900 border-${urgencyColor}-200`}>
              {isTrial ? 'Trial' : 'Blocked'}
            </Badge>
          </div>
          <p className={`text-sm ${textColor} opacity-90`}>{body}</p>
          {isTrial && (
            <p className={`text-xs ${textColor} font-medium`}>
              💰 Save ₹15,000+ monthly in no-shows with automation
            </p>
          )}
        </div>
        <Link href="/dashboard/billing">
          <Button className={`${buttonColor} px-6 py-3 text-white font-semibold shadow-lg`}>
            {isTrial ? 'Upgrade Now' : 'Restore Access'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
