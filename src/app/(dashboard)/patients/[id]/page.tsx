'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { usePatient } from '@/hooks/use-patients'
import { Skeleton } from '@/components/ui/skeleton'
import { Phone, Mail, MapPin, Calendar, Clock, AlertTriangle, Edit } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppointmentCard } from '@/components/appointments/appointment-card'
import { useAppointments } from '@/hooks/use-appointments'
import { useParams } from 'next/navigation'

export default function PatientProfilePage() {
  const params = useParams<{ id: string }>()
  const { data: patient, isLoading } = usePatient(params.id)
  
  // Fetch patient appointments
  const { data: appointments } = useAppointments({
    // We would need to add patient_id filter to the hook/API
    // For now this is a placeholder assuming filter works
    // patient_id: params.id 
  })

  if (isLoading) {
    return <PageContainer><Skeleton className="h-[400px]" /></PageContainer>
  }

  if (!patient) {
    return <PageContainer><div>Patient not found</div></PageContainer>
  }

  const initials = patient.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <PageContainer>
      <Breadcrumbs />

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex items-start gap-6 flex-1">
          <Avatar className="h-24 w-24 border-2 border-primary/10">
            <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{patient.full_name}</h1>
              {patient.is_vip && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">VIP</Badge>}
              {patient.is_blocked && <Badge variant="destructive">Blocked</Badge>}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {patient.email}
                </div>
              )}
              {patient.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {patient.city}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <Button variant="outline" asChild>
            <Link href={`/patients/${patient.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
          <Button>Book Appointment</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{patient.total_visits || 0}</div>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className={`text-2xl font-bold ${patient.no_shows > 0 ? 'text-red-600' : ''}`}>
              {patient.no_shows || 0}
            </div>
            <p className="text-xs text-muted-foreground">No Shows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{patient.cancellations || 0}</div>
            <p className="text-xs text-muted-foreground">Cancellations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {/* Requires backend total_spent calc or field */}
              ₹{patient.total_spent || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {/* This would ideally filter appointments for this patient */}
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p>No appointment history yet</p>
          </div>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Blood Group</h4>
                <p>{patient.blood_group || '-'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Date of Birth</h4>
                <p>{patient.dob ? format(new Date(patient.dob), 'PP') : '-'}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Allergies</h4>
                {patient.allergies ? (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    {patient.allergies}
                  </div>
                ) : (
                  <p>-</p>
                )}
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Medical Notes</h4>
                <p className="whitespace-pre-wrap">{patient.notes || 'No notes recorded.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <p>WhatsApp history integration coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
