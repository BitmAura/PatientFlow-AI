import * as React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { SUBSCRIPTION_PLANS } from '@/constants/plans'
import { UpgradeDialog } from './upgrade-dialog'
import { useUpgradePlan } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import { normalizePlanId } from '@/lib/billing/plans'

interface PlanComparisonProps {
  currentPlanId: string
}

export function PlanComparison({ currentPlanId }: PlanComparisonProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null)
  const upgradePlan = useUpgradePlan()
  const { toast } = useToast()
  const normalizedCurrentPlanId = normalizePlanId(currentPlanId)

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlan(plan)
  }

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return
    try {
      const response = await upgradePlan.mutateAsync({ 
        planId: selectedPlan.id,
        billing_cycle: 'monthly' // TODO: Add annual option toggle
      })
      if (response?.shortUrl) {
        toast({ title: 'Upgrade Initiated', description: 'Redirecting to payment...' })
        window.location.href = response.shortUrl
        return
      }
      toast({ title: 'Plan Updated', description: 'Subscription plan has been updated.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate upgrade'
      toast({ variant: 'destructive', title: 'Error', description: message })
      throw err
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === normalizedCurrentPlanId
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
                  variant={isCurrent ? "outline" : isPopular ? "default" : "secondary"}
                  disabled={isCurrent}
                  onClick={() => !isCurrent && handleUpgradeClick(plan)}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
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
        onConfirm={handleConfirmUpgrade}
      />
    </>
  )
}
