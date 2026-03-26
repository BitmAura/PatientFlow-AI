'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Calendar, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { AppointmentStatus } from '@/constants/appointment-status'
import { useUpdateStatus } from '@/hooks/use-appointments'
import Link from 'next/link'

interface AppointmentActionsProps {
  appointment: any
  onReschedule: () => void
  onCancel: () => void
}

export function AppointmentActions({ appointment, onReschedule, onCancel }: AppointmentActionsProps) {
  const updateStatus = useUpdateStatus()

  const handleStatusChange = (status: AppointmentStatus) => {
    updateStatus.mutate({ id: appointment.id, status })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/appointments/${appointment.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        
        {/* Status Transitions */}
        {appointment.status === AppointmentStatus.PENDING && (
          <DropdownMenuItem onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Confirm
          </DropdownMenuItem>
        )}
        
        {appointment.status === AppointmentStatus.CONFIRMED && (
          <DropdownMenuItem onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Mark Completed
          </DropdownMenuItem>
        )}

        {(appointment.status === AppointmentStatus.PENDING || appointment.status === AppointmentStatus.CONFIRMED) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onReschedule}>
              <Calendar className="mr-2 h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(AppointmentStatus.NO_SHOW)}>
              <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
              Mark No-Show
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCancel} className="text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
