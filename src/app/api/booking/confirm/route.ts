import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmBookingSchema } from '@/lib/validations/booking'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  const validation = confirmBookingSchema.safeParse(body)
  if (!validation.success) {
    return new NextResponse('Invalid data', { status: 400 })
  }

  const { clinic_id, service_id, date, time, patient, payment_id } = validation.data

  // 1. Find or Create Patient
  // Check by phone number within this clinic
  let { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .eq('clinic_id', clinic_id)
    .eq('phone', patient.phone)
    .single()

  let patientId = (existingPatient as any)?.id

  if (!patientId) {
    const patientData = {
      clinic_id,
      full_name: patient.name,
      phone: patient.phone,
      email: patient.email,
      notes: patient.notes
    }

    const { data: newPatient, error: createError } = await (supabase as any)
      .from('patients')
      .insert(patientData)
      .select()
      .single()
    
    if (createError || !newPatient) {
      return new NextResponse('Failed to create patient', { status: 500 })
    }
    
    patientId = (newPatient as any).id
  }

  // 2. Create Appointment
  const [hours, minutes] = time.split(':').map(Number)
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', service_id)
    .single()

  const endTime = new Date(startTime.getTime() + ((service as any)?.duration || 30) * 60000)

  const appointmentData = {
    clinic_id,
    patient_id: patientId,
    service_id,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: 'confirmed',
    notes: patient.notes,
    source: 'online_booking'
  }

  const { data: appointment, error: apptError } = await (supabase as any)
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (apptError || !appointment) {
    return new NextResponse('Failed to create appointment', { status: 500 })
  }

  // 3. Send Confirmation
  // TODO: Send confirmation email/SMS

  return NextResponse.json({ 
    success: true, 
    appointment_id: (appointment as any).id,
    patient_id: patientId
  })
}