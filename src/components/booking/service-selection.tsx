import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { Clock } from 'lucide-react'

interface ServiceSelectionProps {
  services: any[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ServiceSelection({ services, selectedId, onSelect }: ServiceSelectionProps) {
  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <Card 
          key={service.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            selectedId === service.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
          )}
          onClick={() => onSelect(service.id)}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{service.duration} mins</span>
                <span>•</span>
                <span>₹{service.price}</span>
              </div>
            </div>
            <div className={cn(
              "w-4 h-4 rounded-full border border-primary flex items-center justify-center",
              selectedId === service.id ? "bg-primary" : "bg-transparent"
            )}>
              {selectedId === service.id && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
