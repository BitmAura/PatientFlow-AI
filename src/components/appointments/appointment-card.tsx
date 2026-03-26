'use client'

import * as React from 'react'
import { CardContent } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './appointment-status-badge'
import { formatTime } from '@/lib/utils/format-date'
import { Calendar, MoreHorizontal, User } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppointmentCardProps {
  appointment: any
  onAction?: (action: string, appointment: any) => void
}

export function AppointmentCard({
  appointment,
  onAction,
}: AppointmentCardProps) {
  const patient = appointment.patients
  const service = appointment.services

  return (
    <GlassCard className="cursor-pointer border-l-4 border-l-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted/50 p-2 backdrop-blur-sm">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {new Date(appointment.start_time).toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </span>
              <span className="text-lg font-bold">
                {new Date(appointment.start_time).getDate()}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold leading-none">
                  {patient?.full_name}
                </h4>
                <StatusBadge
                  status={appointment.status}
                  showIcon={false}
                  className="h-5 px-1.5 text-[10px]"
                />
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatTime(appointment.start_time)} -{' '}
                {formatTime(appointment.end_time)}
              </p>
              <p className="text-sm font-medium text-primary">
                {service?.name}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 h-8 w-8 hover:bg-white/20"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/appointments/${appointment.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction?.('reschedule', appointment)}
              >
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction?.('cancel', appointment)}
                className="text-red-600"
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </GlassCard>
  )
}
