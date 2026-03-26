"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Calendar } from "lucide-react"
import { useUpdateDoctor } from "@/hooks/use-doctors"
import { toast } from "sonner"

interface DoctorCardProps {
  doctor: any
  onEdit: (doctor: any) => void
  onSchedule: (doctor: any) => void
}

export function DoctorCard({ doctor, onEdit, onSchedule }: DoctorCardProps) {
  const { mutate: update } = useUpdateDoctor()

  const handleToggleActive = (checked: boolean) => {
    update({ id: doctor.id, data: { is_active: checked } }, {
        onSuccess: () => toast.success(`Doctor ${checked ? 'activated' : 'deactivated'}`),
        onError: (err) => toast.error(err.message)
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-muted h-24 relative">
            <div className="absolute -bottom-10 left-6">
                <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage src={doctor.avatar_url} />
                    <AvatarFallback className="text-xl">
                        {doctor.name ? doctor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                    </AvatarFallback>
                </Avatar>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-12 pb-4 px-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialization || "General Practitioner"}</p>
            </div>
            <Badge variant={doctor.staff?.status === 'active' ? 'default' : 'secondary'}>
                {doctor.staff?.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">{doctor.services?.length || 0} Services</Badge>
            {doctor.is_bookable_online && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Online Booking</Badge>}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch 
                checked={doctor.staff?.status === 'active'} 
                onCheckedChange={handleToggleActive}
            />
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onSchedule(doctor)} title="Manage Availability">
                <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(doctor)} title="Edit Profile">
                <Edit className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
