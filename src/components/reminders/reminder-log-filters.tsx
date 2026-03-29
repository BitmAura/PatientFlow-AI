'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Calendar as CalendarIcon, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface ReminderLogFiltersProps {
  filters: any
  onFilterChange: (newFilters: any) => void
  onClear: () => void
}

export function ReminderLogFilters({ filters, onFilterChange, onClear }: ReminderLogFiltersProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  )

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    onFilterChange({
      ...filters,
      date_from: newDate ? newDate.toISOString() : undefined,
      // Simple logic for single date selection, ideally uses a range picker
      date_to: newDate ? new Date(newDate.getTime() + 86400000).toISOString() : undefined
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patient name or phone..."
          className="pl-8"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        <Select 
          value={filters.statuses?.[0] || 'all'} 
          onValueChange={(val) => onFilterChange({ ...filters, page: 1, statuses: val === 'all' ? undefined : [val] })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.types?.[0] || 'all'} 
          onValueChange={(val) => onFilterChange({ ...filters, page: 1, types: val === 'all' ? undefined : [val] })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Message Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="booking_confirmation">Confirmation</SelectItem>
            <SelectItem value="reminder_24h">24h Reminder</SelectItem>
            <SelectItem value="reminder_2h">2h Reminder</SelectItem>
            <SelectItem value="no_show_followup">No-Show</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={onClear} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
