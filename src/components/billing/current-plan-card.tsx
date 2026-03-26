import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog'

interface CurrentPlanCardProps {
  plan: any
  usage: number
  limit: number
  periodEnd: string
  status: string
}

export function CurrentPlanCard({ plan, usage, limit, periodEnd, status }: CurrentPlanCardProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min((usage / limit) * 100, 100)
  const isPaid = plan.price > 0
  
  const isWarning = !isUnlimited && percentage > 80
  const isCritical = !isUnlimited && percentage > 95

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{plan.name} Plan</CardTitle>
            <p className="text-muted-foreground mt-1">
              {plan.price === 0 ? 'Free Forever' : `${formatCurrency(plan.price)}/month`}
            </p>
          </div>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Usage Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Monthly Usage</span>
            <span>{usage} / {isUnlimited ? '∞' : limit} appointments</span>
          </div>
          <Progress value={percentage} className={isCritical ? "bg-red-100 [&>div]:bg-red-600" : ""} />
          {isWarning && (
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Approaching limit. Upgrade to avoid interruption.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Resets on {format(new Date(periodEnd), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Included Features:</p>
          <ul className="space-y-1">
            {plan.features.slice(0, 4).map((feature: string, i: number) => (
              <li key={i} className="text-sm flex items-center text-muted-foreground">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button variant="outline" className="w-full">Manage Subscription</Button>
        {isPaid && (
          <CancelSubscriptionDialog periodEnd={periodEnd}>
            <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-900">
              Cancel Plan
            </Button>
          </CancelSubscriptionDialog>
        )}
      </CardFooter>
    </Card>
  )
}
