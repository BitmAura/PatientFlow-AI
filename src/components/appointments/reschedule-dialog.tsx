'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TimeSlotPicker } from './time-slot-picker'
import { useRescheduleAppointment } from '@/hooks/use-appointments'
import { useAvailableSlots } from '@/hooks/use-available-slots'
import { format } from 'date-fns'

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
}

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [time, setTime] = React.useState<string>('')
  const [reason, setReason] = React.useState('')
  
  const reschedule = useRescheduleAppointment()
  
  const { data: slots, isLoading: isLoadingSlots } = useAvailableSlots({
    date,
    serviceId: appointment?.service_id,
    doctorId: appointment?.doctor_id,
  })

  const handleReschedule = async () => {
    if (!date || !time) return

    await reschedule.mutateAsync({
      id: appointment.id,
      data: {
        new_date: date,
        new_time: time,
        reason,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <Label className="mb-2 block">Select New Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Select New Time</Label>
              {date ? (
                <div className="h-[280px] overflow-y-auto pr-2">
                  <TimeSlotPicker
                    slots={slots || []}
                    selectedTime={time}
                    onSelect={setTime}
                    isLoading={isLoadingSlots}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Please select a date first.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
              <Textarea
                id="reschedule-reason"
                placeholder="Why is this appointment being rescheduled?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule}
            disabled={!date || !time || reschedule.isPending}
          >
            {reschedule.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
