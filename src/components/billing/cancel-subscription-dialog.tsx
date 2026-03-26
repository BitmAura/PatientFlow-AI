'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface CancelSubscriptionDialogProps {
  periodEnd: string
  children: React.ReactNode
}

export function CancelSubscriptionDialog({ periodEnd, children }: CancelSubscriptionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleCancel = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setOpen(false)
    // In a real app, you would trigger a toast or refresh the page here
  }

  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(periodEnd), 'MMM d, yyyy')
    } catch (e) {
      return periodEnd
    }
  }, [periodEnd])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p className="text-zinc-600">
              Your plan will remain active until <span className="font-semibold text-zinc-900">{formattedDate}</span>. 
              After that, your account will revert to the free tier.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600">
              <li>No more charges will be applied.</li>
              <li>You will retain full access to your data.</li>
              <li>You can upgrade again whenever you are ready.</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep My Plan
          </Button>
          <Button 
            variant="ghost" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
