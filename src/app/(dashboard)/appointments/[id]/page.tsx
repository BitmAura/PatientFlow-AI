'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/appointments/appointment-status-badge'
import { AppointmentActions } from '@/components/appointments/appointment-actions'
import { RescheduleDialog } from '@/components/appointments/reschedule-dialog'
import { CancelDialog } from '@/components/appointments/cancel-dialog'
import { useAppointment } from '@/hooks/use-appointments'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { Calendar, Clock, User, Phone, Mail, CreditCard, MessageSquare } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Separator } from '@/components/ui/separator'

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const { data: appointment, isLoading } = useAppointment(params.id)
  
  // Action Dialog State
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)

  if (isLoading) {
    return <PageContainer><Skeleton className="h-[400px]" /></PageContainer>
  }

  if (!appointment) {
    return <PageContainer><div>Appointment not found</div></PageContainer>
  }

  return (
    <PageContainer>
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Appointment Details
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">ID: {appointment.id.slice(0, 8)}</span>
            <StatusBadge status={appointment.status} />
          </div>
        </div>
        
        <div className="flex gap-2">
          <AppointmentActions 
            appointment={appointment}
            onReschedule={() => setRescheduleOpen(true)}
            onCancel={() => setCancelOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.start_time), 'h:mm a')} - {format(new Date(appointment.end_time), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Doctor</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctors?.users?.full_name || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Service</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.services?.name} ({appointment.duration} min)
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {formatCurrency(appointment.services?.price || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Internal Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {appointment.internal_notes || 'No notes added.'}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Patient Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {appointment.patient_notes || 'No notes added.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/History would go here */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card>
            <CardHeader>
              <CardTitle>Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {appointment.patients?.full_name[0]}
                </div>
                <div>
                  <p className="font-medium">{appointment.patients?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Patient since {new Date(appointment.patients?.created_at).getFullYear()}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {appointment.patients?.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {appointment.patients?.email || 'No email'}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment & Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-medium">{formatCurrency(appointment.services?.price || 0)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Deposit Required</span>
                <span className="font-medium">{formatCurrency(appointment.deposit_amount || 0)}</span>
              </div>
              
              <div className="rounded-lg bg-muted p-3 text-center text-sm">
                Status: <span className="font-medium capitalize">{appointment.deposit_status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <RescheduleDialog 
        open={rescheduleOpen} 
        onOpenChange={setRescheduleOpen}
        appointment={appointment}
      />
      <CancelDialog 
        open={cancelOpen} 
        onOpenChange={setCancelOpen}
        appointmentId={appointment.id}
      />
    </PageContainer>
  )
}
