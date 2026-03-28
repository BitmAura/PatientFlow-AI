"use client"

import { useState } from "react"
import { useDoctors } from "@/hooks/use-doctors"
import { DoctorCard } from "@/components/doctors/doctor-card"
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog"
import { DoctorAvailability } from "@/components/doctors/doctor-availability"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader, EmptyState, SkeletonLoader, PageCard } from '@/components/dashboard/PageStructure'

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
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Doctors"
        description="Manage your clinic's doctors and their availability."
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Doctor
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonLoader variant="card" rows={3} />
      ) : (doctors?.length ?? 0) === 0 ? (
        <EmptyState
          title="No doctors added yet"
          description="Start by adding your first doctor profile and schedule."
          action={<Button onClick={() => setIsAddOpen(true)}>Add your first doctor</Button>}
        />
      ) : (
        <PageCard variant="minimal" className="grid gap-4 border-0 p-0 shadow-none md:grid-cols-2 lg:grid-cols-3">
          {doctors?.map((doctor: any) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onEdit={handleEdit}
              onSchedule={handleSchedule}
            />
          ))}
        </PageCard>
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
    </PageContainer>
  )
}
