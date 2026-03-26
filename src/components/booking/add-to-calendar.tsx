'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, Download } from 'lucide-react'
import { generateGoogleCalendarLink, generateOutlookCalendarLink, generateIcsContent } from '@/lib/utils/generate-calendar-links'

interface AddToCalendarProps {
  event: {
    title: string
    description: string
    location: string
    startTime: string // ISO string
    endTime: string // ISO string
  }
}

export function AddToCalendar({ event }: AddToCalendarProps) {
  const handleDownloadIcs = () => {
    const content = generateIcsContent(event)
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'appointment.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={generateOutlookCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            Outlook Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadIcs} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Download .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
