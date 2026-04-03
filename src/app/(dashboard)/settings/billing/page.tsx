'use client'

import * as React from 'react'
import { CurrentPlanCard } from '@/components/billing/current-plan-card'
import { PlanComparison } from '@/components/billing/plan-comparison'
import { BillingHistory } from '@/components/billing/billing-history'
import { useSubscription, useBillingHistory } from '@/hooks/use-subscription'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader } from '@/components/dashboard/PageStructure'

// Fallback subscription data so the page never crashes
const DEFAULT_SUBSCRIPTION = {
  plan: { id: 'starter', name: 'Starter', appointments_limit: 500 },
  usage: 0,
  limit: 500,
  period_end: null,
  status: 'trialing',
  subscription_id: null,
}

export default function BillingPage() {
  const { data: subscriptionRaw, isLoading: subLoading, isError } = useSubscription()
  const { data: history, isLoading: historyLoading } = useBillingHistory()

  const subscription = subscriptionRaw ?? DEFAULT_SUBSCRIPTION

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Billing & Subscription"
        description="Manage your plan, payment methods, and invoices."
      />

      {isError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Could not load subscription details. Showing cached data. Please refresh to try again.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-1">
          <CurrentPlanCard
            plan={subscription.plan}
            usage={subscription.usage}
            limit={subscription.limit}
            periodEnd={subscription.period_end}
            status={subscription.status}
          />
        </div>
        
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
             <CardTitle>Payment Method</CardTitle>
             <CardDescription>Managed securely via Razorpay</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-lg bg-muted/30">
               <div className="flex-1">
                 <p className="text-sm font-medium text-muted-foreground">No payment method on file</p>
                 <p className="text-xs text-muted-foreground mt-1">A payment method will be added when you upgrade to a paid plan via Razorpay.</p>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-4">
          <PlanComparison currentPlanId={subscription.plan?.id ?? 'starter'} />
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and download past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingHistory invoices={history} isLoading={historyLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
