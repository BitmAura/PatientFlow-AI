import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users } from 'lucide-react'

interface DoctorSelectionProps {
  doctors: any[]
  selectedId: string | null | undefined // undefined means 'any'
  onSelect: (id: string | undefined) => void
  serviceId: string | null
}

export function DoctorSelection({ doctors, selectedId, onSelect, serviceId }: DoctorSelectionProps) {
  // Filter doctors who perform this service
  const availableDoctors = React.useMemo(() => {
    if (!serviceId) return []
    return doctors.filter(d => 
        d.services?.some((s: any) => s.service_id === serviceId)
    )
  }, [doctors, serviceId])

  if (availableDoctors.length === 0) {
    return (
        <div className="text-center py-8 text-muted-foreground">
            No specific doctors available for this service.
            <br />
            Proceeding with any available slot.
            <div className="mt-4">
                <button 
                    className="underline text-primary"
                    onClick={() => onSelect(undefined)}
                >
                    Continue
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Any Doctor Option */}
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:border-primary",
          selectedId === undefined ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
        )}
        onClick={() => onSelect(undefined)}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Any Available Doctor</h3>
              <p className="text-sm text-muted-foreground">Maximum availability</p>
            </div>
          </div>
          <div className={cn(
            "w-4 h-4 rounded-full border border-primary flex items-center justify-center",
            selectedId === undefined ? "bg-primary" : "bg-transparent"
          )}>
            {selectedId === undefined && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </CardContent>
      </Card>

      {/* Specific Doctors */}
      {availableDoctors.map((doctor) => (
        <Card 
          key={doctor.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            selectedId === doctor.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
          )}
          onClick={() => onSelect(doctor.id)}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={doctor.avatar_url} />
                <AvatarFallback>{doctor.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialization || "Specialist"}</p>
              </div>
            </div>
            <div className={cn(
              "w-4 h-4 rounded-full border border-primary flex items-center justify-center",
              selectedId === doctor.id ? "bg-primary" : "bg-transparent"
            )}>
              {selectedId === doctor.id && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
