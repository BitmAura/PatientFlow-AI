import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Loader2, Lock } from 'lucide-react'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: any
  onConfirm: () => Promise<void>
}

export function UpgradeDialog({ open, onOpenChange, plan, onConfirm }: UpgradeDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to {plan.name}</DialogTitle>
          <DialogDescription>
            Get access to {plan.features[0]} and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
           <div className="flex justify-between items-center mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
             <span className="font-medium text-slate-900 dark:text-slate-100">Total Due Today</span>
             <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(plan.price)}</span>
           </div>
           
           <p className="text-sm text-gray-500 mb-4">
             You will be redirected to Razorpay to complete the payment securely.
           </p>

           <div className="space-y-2">
             <h4 className="text-sm font-medium">Plan Highlights:</h4>
             <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
               {plan.features.slice(0, 3).map((f: string, i: number) => (
                 <li key={i}>{f}</li>
               ))}
             </ul>
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Pay & Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
