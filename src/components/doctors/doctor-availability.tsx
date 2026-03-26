"use client"

import { useState, useEffect } from "react"
import { useDoctorAvailability, useUpdateDoctorAvailability } from "@/hooks/use-doctors"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DoctorAvailabilityProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: any
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function DoctorAvailability({ open, onOpenChange, doctor }: DoctorAvailabilityProps) {
  const { data: availability, isLoading } = useDoctorAvailability(doctor?.id)
  const { mutate: update, isPending } = useUpdateDoctorAvailability()
  
  const [useClinicHours, setUseClinicHours] = useState(true)
  const [customHours, setCustomHours] = useState<Record<string, any>>({})

  useEffect(() => {
    if (availability) {
        let newUseClinicHours = true
        let newCustomHours: Record<string, any> = {}

        // Check if availability follows the schema structure
        if ('use_clinic_hours' in availability) {
            newUseClinicHours = availability.use_clinic_hours
            newCustomHours = availability.custom_hours || {}
        } else {
            // Legacy: availability is directly the custom_hours map
            const hasOverrides = Object.keys(availability).length > 0
            newUseClinicHours = !hasOverrides
            newCustomHours = availability
        }

        setUseClinicHours(newUseClinicHours)
        
        // Initialize custom hours with defaults if empty
        if (Object.keys(newCustomHours).length === 0) {
            const defaults: any = {}
            DAYS.forEach(day => {
                defaults[day] = { open: "09:00", close: "17:00", is_off: false }
            })
            setCustomHours(defaults)
        } else {
            setCustomHours(newCustomHours)
        }
    }
  }, [availability])

  const handleSave = () => {
    // Construct data according to DoctorAvailabilityInput schema
    const dataToSave = {
        use_clinic_hours: useClinicHours,
        custom_hours: useClinicHours ? undefined : customHours
    }
    
    update({ id: doctor.id, data: dataToSave }, {
        onSuccess: () => {
            toast.success("Availability updated")
            onOpenChange(false)
        },
        onError: (err) => toast.error(err.message)
    })
  }

  const updateDay = (day: string, field: string, value: any) => {
    setCustomHours(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            [field]: value
        }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Availability - {doctor?.name}</DialogTitle>
          <DialogDescription>
            Set custom working hours for this doctor or use clinic defaults.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                        <Label className="text-base">Use Clinic Hours</Label>
                        <p className="text-sm text-muted-foreground">
                            Follow the default opening hours set in clinic settings.
                        </p>
                    </div>
                    <Switch
                        checked={useClinicHours}
                        onCheckedChange={setUseClinicHours}
                    />
                </div>

                {!useClinicHours && (
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Weekly Schedule</h4>
                        {DAYS.map(day => {
                            const schedule = customHours[day] || { open: "09:00", close: "17:00", is_off: false }
                            return (
                                <div key={day} className="flex items-center gap-4 p-3 border rounded-md">
                                    <div className="w-24 capitalize font-medium">{day}</div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            checked={!schedule.is_off} 
                                            onCheckedChange={(c) => updateDay(day, 'is_off', !c)}
                                        />
                                        <span className="text-sm">Available</span>
                                    </div>
                                    
                                    {!schedule.is_off && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <Input 
                                                type="time" 
                                                className="w-32" 
                                                value={schedule.open}
                                                onChange={(e) => updateDay(day, 'open', e.target.value)}
                                            />
                                            <span>to</span>
                                            <Input 
                                                type="time" 
                                                className="w-32" 
                                                value={schedule.close}
                                                onChange={(e) => updateDay(day, 'close', e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {schedule.is_off && (
                                        <div className="ml-auto text-sm text-muted-foreground italic">
                                            Not available
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
