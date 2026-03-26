import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface MobileAppointmentCardProps {
  appointment: any
  onAction: (action: string, appointment: any) => void
}

export function MobileAppointmentCard({ appointment, onAction }: MobileAppointmentCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-red-100 text-red-700',
  }

  return (
    <Card className="mb-4 shadow-sm border-l-4 border-l-blue-600">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{appointment.patients?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{appointment.services?.name}</p>
          </div>
          <Badge className={cn("capitalize", statusColors[appointment.status] || 'bg-gray-100')}>
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(appointment.start_time), 'MMM d')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(appointment.start_time), 'h:mm a')}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex flex-col h-auto py-2 gap-1 text-xs"
            onClick={() => window.open(`tel:${appointment.patients?.phone}`)}
          >
            <Phone className="w-4 h-4" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex flex-col h-auto py-2 gap-1 text-xs"
            onClick={() => window.open(`https://wa.me/${appointment.patients?.phone?.replace(/\D/g, '')}`)}
          >
            <MessageCircle className="w-4 h-4" />
            WA
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex flex-col h-auto py-2 gap-1 text-xs col-span-2 bg-blue-50 text-blue-700 hover:bg-blue-100"
            onClick={() => onAction('reschedule', appointment)}
          >
            Reschedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
