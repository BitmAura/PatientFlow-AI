'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { useAppointments } from '@/hooks/use-appointments'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { AppointmentStatus, APPOINTMENT_STATUS_COLORS } from '@/constants/appointment-status'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<'month' | 'day'>('month') // MVP: Month view only first

  // Fetch appointments for the current month
  const { data: appointmentsData, isLoading } = useAppointments({
    date_from: startOfMonth(currentDate),
    date_to: endOfMonth(currentDate),
    limit: 100, // Fetch more for calendar
  })

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  // Group appointments by date
  const appointmentsByDate = React.useMemo(() => {
    const grouped: Record<string, any[]> = {}
    appointmentsData?.data?.forEach((appt: any) => {
      const dateKey = format(new Date(appt.start_time), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(appt)
    })
    return grouped
  }, [appointmentsData])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
          <div className="flex items-center rounded-md border bg-background">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={goToToday} className="px-3">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b text-center text-sm font-semibold leading-10 text-muted-foreground bg-muted/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 text-sm">
            {/* Offset for first day of month - Simplified for MVP, better use full calendar lib logic */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-muted/10" />
            ))}

            {days.map((day, dayIdx) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayAppointments = appointmentsByDate[dateKey] || []

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "min-h-[120px] border-b border-r p-2 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-primary text-primary-foreground",
                        !isToday(day) && "text-muted-foreground"
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/appointments/new?date=${dateKey}`}>
                        <Plus className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appt) => (
                      <Link 
                        key={appt.id} 
                        href={`/appointments/${appt.id}`}
                        className={cn(
                          "block truncate rounded px-1.5 py-0.5 text-xs font-medium border transition-colors hover:opacity-80",
                          APPOINTMENT_STATUS_COLORS[appt.status as AppointmentStatus]
                        )}
                      >
                        {format(new Date(appt.start_time), 'h:mm a')} {appt.patients.full_name}
                      </Link>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        + {dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
