import * as React from 'react'
import { MapPin, Phone } from 'lucide-react'

interface ClinicHeaderProps {
  clinic: any
}

export function ClinicHeader({ clinic }: ClinicHeaderProps) {
  return (
    <div className="text-center space-y-3 mb-6">
      {/* Logo Placeholder */}
      <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary font-bold text-xl">
        {clinic.name.substring(0, 2).toUpperCase()}
      </div>
      
      <div>
        <h1 className="text-xl font-bold">{clinic.name}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
          <MapPin className="w-3 h-3" />
          <span>{clinic.address || 'Address not available'}</span>
        </div>
        {clinic.phone && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Phone className="w-3 h-3" />
            <a href={`tel:${clinic.phone}`} className="hover:text-primary transition-colors">{clinic.phone}</a>
          </div>
        )}
      </div>
    </div>
  )
}
