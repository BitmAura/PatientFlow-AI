'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { addDays, format, startOfMonth, subDays, subMonths } from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangeSelectorProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DateRangeSelector({ date, setDate }: DateRangeSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const presets = [
    { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    { label: 'Last Month', getValue: () => {
      const lastMonth = subMonths(new Date(), 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) } 
    }},
  ]

  // Helper because endOfMonth is not imported in presets closure
  function endOfMonth(date: Date) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    return d
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="p-4 border-r space-y-2">
              <h4 className="font-medium text-sm mb-4">Presets</h4>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setDate(preset.getValue())
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
