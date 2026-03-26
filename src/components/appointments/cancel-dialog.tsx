'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateStatus } from '@/hooks/use-appointments'
import { AppointmentStatus } from '@/constants/appointment-status'

interface CancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
}

export function CancelDialog({ open, onOpenChange, appointmentId }: CancelDialogProps) {
  const [reason, setReason] = React.useState('')
  const updateStatus = useUpdateStatus()

  const handleCancel = async () => {
    await updateStatus.mutateAsync({
      id: appointmentId,
      status: AppointmentStatus.CANCELLED,
      reason,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Cancellation</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Patient called to cancel, Emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Appointment
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={!reason.trim() || updateStatus.isPending}
          >
            {updateStatus.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
