import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { format } from 'date-fns'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog'
import { cn } from '@/lib/utils/cn'

interface CurrentPlanCardProps {
  plan: any
  usage: number
  limit: number
  periodEnd: string
  status: string
  onManageSubscription?: () => void
}

export function CurrentPlanCard({ plan, usage, limit, periodEnd, status, onManageSubscription }: CurrentPlanCardProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min((usage / limit) * 100, 100)
  const isPaid = plan.price > 0
  
  const isWarning = !isUnlimited && percentage > 80
  const isCritical = !isUnlimited && percentage > 95

  return (
    <Card className="h-full flex flex-col border-emerald-100 dark:border-emerald-900/20 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">{plan.name} Plan</CardTitle>
            <p className="text-emerald-600 font-bold mt-1 text-sm">
              {status === 'trialing' ? '14-Day Free Trial' : `${formatCurrency(plan.price)}/month`}
            </p>
          </div>
          <Badge className={cn(
            "font-black tracking-widest",
            status === 'trialing' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
          )}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Usage Meter */}
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
            <span>WhatsApp Volume</span>
            <span className="text-emerald-600">{usage} / {isUnlimited ? '∞' : limit}</span>
          </div>
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isCritical ? "bg-red-100 [&>div]:bg-red-600" : "bg-emerald-100 [&>div]:bg-emerald-500"
            )} 
          />
          {isWarning && (
            <p className="text-[10px] font-bold text-amber-600 flex items-center mt-1 uppercase tracking-tighter">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Approaching Profit Protection limit. Upgrade to maintain automation.
            </p>
          )}
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Trial Period Ends</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {periodEnd ? format(new Date(periodEnd), 'MMM d, yyyy') : 'No date set'}
            </p>
          </div>
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
        <Button variant="outline" className="w-full" onClick={onManageSubscription}>
          {status === 'trialing' ? 'Activate a Plan' : 'Manage Subscription'}
        </Button>
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
