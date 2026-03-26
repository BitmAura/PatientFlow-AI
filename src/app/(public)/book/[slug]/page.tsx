'use client'

import * as React from 'react'
import { useClinicBookingInfo, useAvailableSlots, useConfirmBooking } from '@/hooks/use-booking'
import { BookingPageLayout } from '@/components/booking/booking-page-layout'
import { ClinicHeader } from '@/components/booking/clinic-header'
import { BookingStepper } from '@/components/booking/booking-stepper'
import { ServiceSelection } from '@/components/booking/service-selection'
import { DoctorSelection } from '@/components/booking/doctor-selection'
import { DateSelection } from '@/components/booking/date-selection'
import { TimeSlotSelection } from '@/components/booking/time-slot-selection'
import { PatientDetailsForm } from '@/components/booking/patient-details-form'
import { BookingConfirmation } from '@/components/booking/booking-confirmation'
import { DepositPayment } from '@/components/booking/deposit-payment'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { PatientDetails } from '@/lib/validations/booking'

export default function BookingPage({ params }: { params: { slug: string } }) {
  const { data: info, isLoading: infoLoading, error } = useClinicBookingInfo(params.slug)
  const [step, setStep] = React.useState(0)
  
  // Form State
  const [serviceId, setServiceId] = React.useState<string | null>(null)
  const [doctorId, setDoctorId] = React.useState<string | undefined>(undefined)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string | null>(null)
  const [patient, setPatient] = React.useState<PatientDetails>({ name: '', phone: '', email: '', notes: '' })
  const [confirmedData, setConfirmedData] = React.useState<any>(null)
  const [paymentId, setPaymentId] = React.useState<string | null>(null)

  const confirmBooking = useConfirmBooking()
  const { toast } = useToast()

  // Derived State
  const selectedService = React.useMemo(() => 
    info?.services.find((s: any) => s.id === serviceId), 
    [info, serviceId]
  )
  const hasPayment = (selectedService?.deposit_amount || 0) > 0
  
  // Determine if we should show doctor step
  // Only show if there are doctors AND if we haven't selected a service yet OR the selected service has associated doctors
  const availableDoctors = React.useMemo(() => {
    if (!info?.doctors) return []
    if (!serviceId) return info.doctors
    return info.doctors.filter((d: any) => d.services?.some((s: any) => s.service_id === serviceId))
  }, [info?.doctors, serviceId])

  const showDoctorStep = (info?.doctors?.length || 0) > 0;

  // Step Mapping
  const STEP_SERVICE = 0
  const STEP_DOCTOR = showDoctorStep ? 1 : -1
  const STEP_DATE = showDoctorStep ? 2 : 1
  const STEP_TIME = showDoctorStep ? 3 : 2
  const STEP_DETAILS = showDoctorStep ? 4 : 3
  const STEP_PAYMENT = hasPayment ? (showDoctorStep ? 5 : 4) : -1
  const STEP_DONE = hasPayment ? (showDoctorStep ? 6 : 5) : (showDoctorStep ? 5 : 4)

  // Fetch Slots when date selected
  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    params.slug, 
    serviceId, 
    dateStr,
    doctorId
  )

  if (infoLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (error || !info) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Clinic not found</div>
  }

  const handleBookingSubmission = async (pId?: string) => {
    try {
      const result = await confirmBooking.mutateAsync({
        clinic_id: info.clinic.id,
        service_id: serviceId!,
        doctor_id: doctorId,
        date: dateStr!,
        time: time!,
        patient,
        payment_id: pId
      })
      setConfirmedData({ 
        ...result, 
        date: dateStr, 
        time, 
        patient,
        service: selectedService,
        clinic: info.clinic,
        doctor: doctorId ? info.doctors.find((d: any) => d.id === doctorId) : undefined
      })
      setStep(STEP_DONE)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Booking Failed', description: 'Please try again.' })
    }
  }

  const handleNext = async () => {
    if (step === STEP_DETAILS) {
      // Validate Patient
      if (!patient.name || !patient.phone || patient.phone.length !== 10) {
        toast({ variant: 'destructive', title: 'Invalid Details', description: 'Please enter valid name and 10-digit phone.' })
        return
      }
      
      if (hasPayment) {
        setStep(STEP_PAYMENT)
      } else {
        await handleBookingSubmission()
      }
    } else {
      setStep(step + 1)
    }
  }

  const handlePaymentSuccess = async (pId: string) => {
    setPaymentId(pId)
    await handleBookingSubmission(pId)
  }

  const handleBack = () => setStep(step - 1)

  return (
    <BookingPageLayout>
      {step < STEP_DONE && <ClinicHeader clinic={info.clinic} />}
      {step < STEP_DONE && (
        <BookingStepper 
            currentStep={step} 
            hasPayment={hasPayment} 
            showDoctorStep={showDoctorStep}
        />
      )}

      <div className="flex-1 p-6">
          {step === STEP_SERVICE && (
            <ServiceSelection 
              services={info.services} 
              selectedId={serviceId} 
              onSelect={(id) => { 
                setServiceId(id); 
                setDoctorId(undefined); // Reset doctor
                setStep(step + 1) 
              }} 
            />
          )}

          {step === STEP_DOCTOR && (
            <DoctorSelection
                doctors={availableDoctors}
                selectedId={doctorId}
                serviceId={serviceId}
                onSelect={(id) => { setDoctorId(id); setStep(step + 1) }}
            />
          )}

          {step === STEP_DATE && (
            <DateSelection 
              selectedDate={date} 
              onSelect={(d) => { setDate(d); if(d) setStep(step + 1) }} 
            />
          )}

          {step === STEP_TIME && (
            <TimeSlotSelection 
              slots={slots} 
              selectedTime={time} 
              onSelect={(t) => { setTime(t); setStep(step + 1) }} 
              isLoading={slotsLoading}
            />
          )}

          {step === STEP_DETAILS && (
            <PatientDetailsForm data={patient} onChange={setPatient} />
          )}

          {step === STEP_PAYMENT && hasPayment && selectedService && (
            <DepositPayment 
              amount={selectedService.deposit_amount}
              serviceName={selectedService.name}
              clinicName={info.clinic.name}
              patient={patient}
              onSuccess={handlePaymentSuccess}
              onCancel={handleBack}
            />
          )}

          {step === STEP_DONE && confirmedData && (
            <BookingConfirmation data={confirmedData} />
          )}
        </div>

        {/* Footer Actions */}
        {step > 0 && step < STEP_DONE && step !== STEP_PAYMENT && (
          <div className="p-4 border-t flex justify-between bg-gray-50">
            <Button variant="ghost" onClick={handleBack} disabled={confirmBooking.isPending}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {step === STEP_DETAILS && (
              <Button onClick={handleNext} disabled={confirmBooking.isPending}>
                {confirmBooking.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (hasPayment ? 'Proceed to Payment' : 'Confirm Booking')}
              </Button>
            )}
            
            {/* Allow skipping doctor step if explicitly "Any" is selected via button, 
                but our DoctorSelection component handles the click. 
                Maybe add a Skip button if doctor step is active? 
                No, DoctorSelection has "Any Doctor" option. */}
          </div>
        )}
    </BookingPageLayout>
  )
}
