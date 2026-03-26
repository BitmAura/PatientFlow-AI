'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface UsageData {
  appointmentsUsed: number
  appointmentsLimit: number
  planId: string
}

export function UsageMeter() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  async function fetchUsage() {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      setLoading(false)
      return
    }

    // Get current month's appointment count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Get user's clinic
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()

    if (!staff) {
      setLoading(false)
      return
    }

    // Count appointments this month
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', staff.clinic_id)
      .gte('created_at', startOfMonth.toISOString())

    const limits = {
      clinic: 500,
      hospital: -1 // unlimited
    }

    setUsage({
      appointmentsUsed: count || 0,
      appointmentsLimit: limits[subscription.plan_id as keyof typeof limits],
      planId: subscription.plan_id
    })

    setLoading(false)
  }

  if (loading || !usage) return null

  const isUnlimited = usage.appointmentsLimit === -1
  const percentageUsed = isUnlimited 
    ? 0 
    : (usage.appointmentsUsed / usage.appointmentsLimit) * 100
  const isNearLimit = percentageUsed > 80 && !isUnlimited

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          {isNearLimit && (
            <Badge variant="destructive" className="text-xs">
              Near Limit
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{usage.appointmentsUsed}</span>
          <span className="text-sm text-muted-foreground">
            {isUnlimited ? 'unlimited' : `of ${usage.appointmentsLimit}`} appointments
          </span>
        </div>

        {!isUnlimited && (
          <>
            <Progress value={percentageUsed} className="h-2" />
            
            {isNearLimit && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">
                    You&apos;ve used {Math.round(percentageUsed)}% of your monthly limit
                  </p>
                  <Link href="/dashboard/billing">
                    <Button variant="link" className="h-auto p-0 text-xs text-amber-700 hover:text-amber-900">
                      Upgrade to Hospital plan →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {isUnlimited && (
          <p className="text-xs text-muted-foreground">
            You have unlimited appointments on the Hospital plan
          </p>
        )}
      </CardContent>
    </Card>
  )
}
