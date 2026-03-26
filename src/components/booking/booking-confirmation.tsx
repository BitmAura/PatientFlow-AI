import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, MapPin, Calendar, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { AddToCalendar } from '@/components/booking/add-to-calendar'

interface BookingConfirmationProps {
  data: {
    appointment: {
      id: string
      start_time: string
      end_time: string
    }
    clinic: {
      name: string
      address: string
    }
    service: {
      name: string
      duration: number
    }
    patient: {
      name: string
    }
    date: string
    time: string
  }
}

export function BookingConfirmation({ data }: BookingConfirmationProps) {
  const startTime = new Date(`${data.date}T${data.time}`)
  const endTime = new Date(startTime.getTime() + (data.service?.duration || 30) * 60000)

  const event = {
    title: `${data.service?.name || 'Appointment'} with ${data.clinic?.name}`,
    description: `Appointment for ${data.patient.name} at ${data.clinic?.name}. Service: ${data.service?.name}`,
    location: data.clinic?.address || '',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }

  return (
    <div className="text-center space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-2">
          Your appointment is successfully scheduled. A confirmation has been sent to your phone.
        </p>
      </div>

      <Card className="text-left border-l-4 border-l-green-500 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{format(new Date(data.date), 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{data.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium text-gray-900">{data.patient.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{data.clinic?.name}</p>
                <p className="text-sm text-gray-500">{data.clinic?.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-2">
        <AddToCalendar event={event} />
        
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Book Another Appointment
        </Button>
      </div>
    </div>
  )
}
