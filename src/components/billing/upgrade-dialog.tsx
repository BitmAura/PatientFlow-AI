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
import { Loader2, Lock, AlertCircle } from 'lucide-react'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: any
  onConfirm: () => Promise<void>
}

export function UpgradeDialog({ open, onOpenChange, plan, onConfirm }: UpgradeDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upgrade'
      setError(errorMessage)
      console.error('Upgrade error:', err)
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
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">Payment Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              {error.includes('not configured') && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  ℹ️ Please contact support to complete payment setup
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="py-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
            <span className="font-medium text-slate-900 dark:text-slate-100">Total Due Today</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(plan.price)}</span>
          </div>
           
          <p className="text-sm text-gray-500">
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={loading || !!error}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay & Upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
