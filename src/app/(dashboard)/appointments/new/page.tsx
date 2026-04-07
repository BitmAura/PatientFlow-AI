'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientSelector } from '@/components/appointments/patient-selector'
import { ServiceSelector } from '@/components/appointments/service-selector'
import { DoctorSelector } from '@/components/doctors/doctor-selector'
import { TimeSlotPicker } from '@/components/appointments/time-slot-picker'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAppointmentSchema } from '@/lib/validations/appointment'
import { useAvailableSlots } from '@/hooks/use-available-slots'
import { useCreateAppointment } from '@/hooks/use-appointments'
import { useClinicStore } from '@/stores/clinic-store'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const STEPS = ['Patient', 'Service', 'Date & Time', 'Review']

export default function CreateAppointmentPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const router = useRouter()
  const { clinic } = useClinicStore()
  
  // Form State
  const [patientId, setPatientId] = React.useState<string>()
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [serviceId, setServiceId] = React.useState<string>()
  const [selectedService, setSelectedService] = React.useState<any>(null)
  const [doctorId, setDoctorId] = React.useState<string>()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [time, setTime] = React.useState<string>()
  const [notes, setNotes] = React.useState('')

  const createAppointment = useCreateAppointment()

  // Available Slots Query
  const { data: slots, isLoading: isLoadingSlots } = useAvailableSlots({
    date,
    serviceId,
    doctorId
  })

  // Handlers
  const handleNext = () => {
    if (currentStep === 0 && !patientId) return
    if (currentStep === 1 && !serviceId) return
    if (currentStep === 2 && (!date || !time)) return
    
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!patientId || !serviceId || !date || !time) return

    try {
      await createAppointment.mutateAsync({
        patient_id: patientId,
        service_id: serviceId,
        scheduled_date: date,
        scheduled_time: time,
        notes,
        doctor_id: doctorId || undefined,
      })
      
      toast.success('Appointment created successfully')
      router.push('/appointments')
    } catch (error) {
      console.error('Failed to create appointment', error)
      toast.error('Failed to create appointment')
    }
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">New Appointment</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0" />
            {/* Progress Bar Active */}
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary -z-0 transition-all duration-300" 
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Select Patient</h2>
                <PatientSelector
                  value={patientId}
                  onSelect={(id, patient) => {
                    setPatientId(id)
                    setSelectedPatient(patient)
                  }}
                  onCreateNew={() => router.push('/patients/new')}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Select Service</h2>
                <ServiceSelector
                  value={serviceId}
                  onSelect={(id, service) => {
                    setServiceId(id)
                    setSelectedService(service)
                    setDoctorId(undefined)
                  }}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Select Doctor (Optional)</h3>
                    <DoctorSelector
                        value={doctorId}
                        onSelect={setDoctorId}
                        serviceId={serviceId}
                        showAnyOption={true}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Pick a Date</h3>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border w-full"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Available Times</h3>
                  {date ? (
                    <div className="h-[300px] overflow-y-auto pr-2">
                      <TimeSlotPicker
                        slots={slots || []}
                        selectedTime={time}
                        onSelect={setTime}
                        isLoading={isLoadingSlots}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Please select a date first.</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review & Confirm</h2>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-24 shrink-0">Patient</span>
                    <div>
                      <span className="font-medium">{selectedPatient?.full_name || '—'}</span>
                      {selectedPatient?.phone && (
                        <span className="block text-xs text-muted-foreground">{selectedPatient.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-24 shrink-0">Service</span>
                    <div>
                      <span className="font-medium">{selectedService?.name || '—'}</span>
                      {selectedService && (
                        <span className="block text-xs text-muted-foreground">
                          {selectedService.duration} min &bull; ₹{selectedService.price?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-24 shrink-0">Date & Time</span>
                    <span className="font-medium">
                      {date && format(date, 'EEEE, MMMM d, yyyy')} at {time}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any internal notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={createAppointment.isPending}
              className="w-32"
            >
              {createAppointment.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !patientId) ||
                (currentStep === 1 && !serviceId) ||
                (currentStep === 2 && (!date || !time))
              }
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
