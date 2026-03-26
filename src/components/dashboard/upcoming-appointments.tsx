'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppointments } from '@/hooks/use-appointments'
import { format } from 'date-fns'
import Link from 'next/link'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export function UpcomingAppointments() {
  const { data: appointments, isLoading } = useAppointments()

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />
  }

  // Filter for future appointments (excluding today)
  const upcoming =
    (appointments as any[])
      ?.filter((a: any) => new Date(a.start_time) > new Date())
      .slice(0, 5) || []

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming</CardTitle>
        <Button variant="link" size="sm" asChild>
          <Link href="/appointments">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="You don't have any future appointments scheduled."
            icon={Calendar}
            className="border-none bg-transparent py-6"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.map((appointment: any) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>
                        {format(new Date(appointment.start_time), 'MMM d')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(appointment.start_time), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.patients?.full_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        appointment.status === 'confirmed'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </GlassCard>
  )
}
