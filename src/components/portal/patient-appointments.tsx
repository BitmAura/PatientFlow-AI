'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentCard } from './appointment-card'
import { RescheduleRequestDialog } from './reschedule-request-dialog'
import { CancelRequestDialog } from './cancel-request-dialog'
import { usePatientAppointments } from '@/hooks/use-portal-appointments'
import { Loader2 } from 'lucide-react'

export function PatientAppointments() {
  const { data, isLoading } = usePatientAppointments()
  const [rescheduleApt, setRescheduleApt] = React.useState<any>(null)
  const [cancelApt, setCancelApt] = React.useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {data?.upcoming?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">No upcoming appointments.</p>
            </div>
          ) : (
            data?.upcoming?.map((apt: any) => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt} 
                onReschedule={setRescheduleApt}
                onCancel={setCancelApt}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {data?.past?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">No past appointments.</p>
            </div>
          ) : (
             data?.past?.map((apt: any) => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt} 
                onReschedule={() => {}} 
                onCancel={() => {}}
                isPast
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <RescheduleRequestDialog 
        open={!!rescheduleApt} 
        onOpenChange={(open) => !open && setRescheduleApt(null)}
        appointment={rescheduleApt}
      />

      <CancelRequestDialog 
        open={!!cancelApt} 
        onOpenChange={(open) => !open && setCancelApt(null)}
        appointment={cancelApt}
      />
    </>
  )
}
