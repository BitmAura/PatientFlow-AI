import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface AppointmentCardProps {
  appointment: any
  onReschedule: (apt: any) => void
  onCancel: (apt: any) => void
  isPast?: boolean
}

export function AppointmentCard({ appointment, onReschedule, onCancel, isPast }: AppointmentCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-red-100 text-red-700',
    reschedule_requested: 'bg-amber-100 text-amber-700',
    cancellation_requested: 'bg-amber-100 text-amber-700',
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{appointment.services?.name}</h3>
            <p className="text-sm text-muted-foreground">{appointment.clinics?.name}</p>
          </div>
          <Badge className={statusColors[appointment.status] || 'bg-gray-100'}>
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(appointment.start_time), 'h:mm a')} ({appointment.services?.duration_minutes} mins)</span>
          </div>
          {appointment.clinics?.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{appointment.clinics.address}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {!isPast && !['cancelled', 'no_show'].includes(appointment.status) && (
        <CardFooter className="bg-gray-50 p-3 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 text-xs sm:text-sm"
            onClick={() => onReschedule(appointment)}
          >
            Reschedule
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onCancel(appointment)}
          >
            Cancel
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
