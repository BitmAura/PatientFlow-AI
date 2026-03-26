"use client"

import { useState } from "react"
import { useDoctors } from "@/hooks/use-doctors"
import { DoctorCard } from "@/components/doctors/doctor-card"
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog"
import { DoctorAvailability } from "@/components/doctors/doctor-availability"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)
  const [scheduleDoctor, setScheduleDoctor] = useState<any>(null)

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor)
    setIsAddOpen(true)
  }

  const handleSchedule = (doctor: any) => {
    setScheduleDoctor(doctor)
  }

  const handleCloseForm = (open: boolean) => {
    setIsAddOpen(open)
    if (!open) setEditingDoctor(null)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Doctors</h2>
            <p className="text-muted-foreground">
                Manage your clinic&apos;s doctors and their availability.
            </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Doctor
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors?.length === 0 && (
                <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-muted-foreground">No doctors added yet</h3>
                    <Button variant="link" onClick={() => setIsAddOpen(true)}>Add your first doctor</Button>
                </div>
            )}
            {doctors?.map((doctor: any) => (
                <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onEdit={handleEdit}
                    onSchedule={handleSchedule}
                />
            ))}
        </div>
      )}

      <DoctorFormDialog 
        open={isAddOpen} 
        onOpenChange={handleCloseForm}
        doctor={editingDoctor}
      />

      {scheduleDoctor && (
        <DoctorAvailability 
            open={!!scheduleDoctor} 
            onOpenChange={(open) => !open && setScheduleDoctor(null)}
            doctor={scheduleDoctor}
        />
      )}
    </div>
  )
}
