import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { addMonths } from 'date-fns'

interface DateSelectionProps {
  selectedDate: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export function DateSelection({ selectedDate, onSelect }: DateSelectionProps) {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={(date) => date < new Date() || date > addMonths(new Date(), 2)}
        initialFocus
        className="rounded-md border shadow p-4 w-full max-w-[350px]"
      />
    </div>
  )
}
