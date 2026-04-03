'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import {
  useAppointments,
  useUpdateAppointmentStatus,
} from '@/hooks/use-appointments'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Phone, Check, X } from 'lucide-react'
import { formatTime } from '@/lib/utils/format-date'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TodayAppointments() {
  const router = useRouter()
  const { data: appointments, isLoading, isError } = useAppointments({
    date: new Date(),
  })
  const updateStatus = useUpdateAppointmentStatus()

  if (isLoading) {
    return (
      <GlassCard className="col-span-1 lg:col-span-4">
        <CardHeader><CardTitle>Today&apos;s Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </CardContent>
      </GlassCard>
    )
  }

  if (isError) {
    return (
      <GlassCard className="col-span-1 lg:col-span-4">
        <CardHeader><CardTitle>Today&apos;s Schedule</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Could not load appointments. Please refresh the page.
          </p>
        </CardContent>
      </GlassCard>
    )
  }

  const todayAppointments = appointments || []

  return (
    <GlassCard className="col-span-1 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/appointments/calendar">View Calendar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {todayAppointments.length === 0 ? (
            <EmptyState
              title="No appointments today"
              description="Your schedule is clear for today. Enjoy the day!"
              icon={Check}
              actionLabel="Book Appointment"
              action={() => router.push('/appointments/new')}
            />
          ) : (
            todayAppointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="group flex items-start justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 pt-1 text-sm font-medium text-muted-foreground">
                    {formatTime(appointment.start_time)}
                  </div>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-10 h-full w-px bg-border group-last:hidden" />

                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback>
                        {appointment.patients?.full_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {appointment.patients?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.services?.name}
                    </p>
                    {appointment.status === 'pending' && (
                      <Badge variant="secondary" className="mt-1">
                        Pending
                      </Badge>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Badge className="mt-1 border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
                        Confirmed
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() =>
                          updateStatus.mutate({
                            id: appointment.id,
                            status: 'confirmed',
                          })
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          updateStatus.mutate({
                            id: appointment.id,
                            status: 'cancelled',
                          })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Patient</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Mark No-Show
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </GlassCard>
  )
}
