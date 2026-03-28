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
import { PageHeader, PageCard, EmptyState, SkeletonLoader } from '@/components/dashboard/PageStructure'

export default function AppointmentsPage() {
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
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Appointments"
        description="Manage your schedule and bookings."
        actions={(
          <>
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
          </>
        )}
        filters={(
          <div className="flex w-full flex-col gap-4 sm:flex-row">
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
        )}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader variant="list" rows={5} />
      ) : appointmentsData?.data?.length === 0 ? (
        <EmptyState
          icon={<List className="h-12 w-12" />}
          title="No appointments found"
          description="Try adjusting your filters or create a new appointment."
          action={
            <Button asChild>
              <Link href="/appointments/new">Create Appointment</Link>
            </Button>
          }
        />
      ) : (
        <PageCard variant="minimal" className="grid gap-4 p-0 border-0 shadow-none">
          {appointmentsData?.data?.map((appointment: any) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onAction={handleAction}
            />
          ))}
        </PageCard>
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
