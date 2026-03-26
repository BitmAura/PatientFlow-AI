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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useRequestCancel } from '@/hooks/use-portal-appointments'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CancelRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
}

export function CancelRequestDialog({ open, onOpenChange, appointment }: CancelRequestDialogProps) {
  const [reason, setReason] = React.useState('')
  const requestCancel = useRequestCancel()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!appointment) return
    try {
      await requestCancel.mutateAsync({ id: appointment.id, reason })
      toast({ title: 'Request Sent', description: 'Cancellation request submitted.' })
      onOpenChange(false)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Deposit Policy</p>
            <p>If you paid a deposit, it may be non-refundable if cancelled less than 24 hours in advance.</p>
          </div>
        </div>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason for Cancellation</Label>
            <Select onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule_conflict">Schedule Conflict</SelectItem>
                <SelectItem value="feeling_better">Feeling Better / Not Needed</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Appointment</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={requestCancel.isPending || !reason}
            variant="destructive"
          >
            {requestCancel.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
