import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'

interface MobilePatientCardProps {
  patient: any
  onAction: (action: string, patient: any) => void
}

export function MobilePatientCard({ patient, onAction }: MobilePatientCardProps) {
  return (
    <Card className="mb-3 shadow-sm active:bg-gray-50 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
            {patient.full_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{patient.full_name}</h3>
          <p className="text-sm text-muted-foreground truncate">{patient.phone}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full text-green-600 bg-green-50"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`tel:${patient.phone}`)
            }}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onAction('view', patient)}
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
