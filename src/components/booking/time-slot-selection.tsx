import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface TimeSlotSelectionProps {
  slots: { time: string, available: boolean }[] | undefined
  selectedTime: string | null
  onSelect: (time: string) => void
  isLoading: boolean
}

export function TimeSlotSelection({ slots, selectedTime, onSelect, isLoading }: TimeSlotSelectionProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No slots available for this date.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {slots.map((slot) => (
        <Button
          key={slot.time}
          variant={selectedTime === slot.time ? "default" : "outline"}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className="w-full"
        >
          {slot.time}
        </Button>
      ))}
    </div>
  )
}
