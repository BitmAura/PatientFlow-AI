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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRequestReschedule } from '@/hooks/use-portal-appointments'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RescheduleRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
}

export function RescheduleRequestDialog({ open, onOpenChange, appointment }: RescheduleRequestDialogProps) {
  const [date, setDate] = React.useState('')
  const [time, setTime] = React.useState('')
  const [reason, setReason] = React.useState('')
  
  const requestReschedule = useRequestReschedule()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!appointment) return
    try {
      await requestReschedule.mutateAsync({
        id: appointment.id,
        data: { preferred_date: date, preferred_time: time, reason }
      })
      toast({ title: 'Request Sent', description: 'The clinic will contact you to confirm.' })
      onOpenChange(false)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Reschedule</DialogTitle>
          <DialogDescription>
            Propose a new time. We will confirm availability shortly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                  <SelectItem value="evening">Evening (4PM - 7PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea 
              placeholder="Why do you need to reschedule?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={requestReschedule.isPending}>
            {requestReschedule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
