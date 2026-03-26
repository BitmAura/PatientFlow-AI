'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { useAppointments } from '@/hooks/use-appointments'
import { Plus, Search, Filter, Calendar as CalendarIcon, List } from 'lucide-react'
import Link from 'next/link'
import { RescheduleDialog } from '@/components/appointments/reschedule-dialog'
import { CancelDialog } from '@/components/appointments/cancel-dialog'
import { ExportButton } from '@/components/shared/export-button'
import { ExportAppointmentsDialog } from '@/components/appointments/export-appointments-dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export default function AppointmentsPage() {
  const [view, setView] = React.useState<'list' | 'calendar'>('list')
  const [search, setSearch] = React.useState('')
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>([])
  
  // Action Dialog State
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null)

  const { data: appointmentsData, isLoading } = useAppointments({
    search,
    status: selectedStatus,
    // Default to this month or recent if no date filter
  })

  const handleAction = (action: string, appointment: any) => {
    setSelectedAppointment(appointment)
    if (action === 'reschedule') setRescheduleOpen(true)
    if (action === 'cancel') setCancelOpen(true)
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule and bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={() => setExportOpen(true)} label="Export" formats={['excel', 'csv', 'pdf']} />
          <Button variant="outline" asChild>
            <Link href="/appointments/calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or phone..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatus.includes(status)}
                onCheckedChange={(checked) => {
                  setSelectedStatus(prev => 
                    checked ? [...prev, status] : prev.filter(s => s !== status)
                  )
                }}
                className="capitalize"
              >
                {status.replace('_', '-')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : appointmentsData?.data?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <List className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No appointments found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create a new appointment.
          </p>
          <Button asChild>
            <Link href="/appointments/new">Create Appointment</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointmentsData?.data?.map((appointment: any) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Action Dialogs */}
      {selectedAppointment && (
        <>
          <RescheduleDialog 
            open={rescheduleOpen} 
            onOpenChange={setRescheduleOpen}
            appointment={selectedAppointment}
          />
          <CancelDialog 
            open={cancelOpen} 
            onOpenChange={setCancelOpen}
            appointmentId={selectedAppointment.id}
          />
        </>
      )}

      <ExportAppointmentsDialog 
        open={exportOpen} 
        onOpenChange={setExportOpen} 
      />
    </PageContainer>
  )
}
