'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeSlotPickerProps {
  slots: any[]
  selectedTime?: string
  onSelect: (time: string) => void
  isLoading?: boolean
}

export function TimeSlotPicker({ slots, selectedTime, onSelect, isLoading }: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
        No available slots for this date.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot.time}
          type="button"
          variant={selectedTime === slot.time ? "default" : "outline"}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
          className={cn(
            "w-full text-sm",
            !slot.available && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {slot.time}
        </Button>
      ))}
    </div>
  )
}
