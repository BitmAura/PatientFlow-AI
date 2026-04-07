import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAppointmentSchema, appointmentFiltersSchema } from '@/lib/validations/appointment'
import { addMinutes, format } from 'date-fns'
import { writeAuditLog } from '@/lib/audit/log'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { bookingConfirmationTemplate } from '@/lib/email/templates'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  
  // Parse array params manually since Object.fromEntries only takes last value
  const status = searchParams.getAll('status[]')
  
  const supabase = createClient()

  // Get current user's clinic
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(full_name, phone, email),
      services(name, duration, price),
      doctors(name)
    `)
    .eq('clinic_id', (staff as any).clinic_id)

  // Apply filters
  if (status.length > 0) query = query.in('status', status)
  if (queryParams.date) query = query.eq('start_time::date', queryParams.date)
  if (queryParams.doctor_id) query = query.eq('doctor_id', queryParams.doctor_id)
  if (queryParams.service_id) query = query.eq('service_id', queryParams.service_id)

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) {
    return new NextResponse('Failed to fetch appointments', { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate request
  const result = createAppointmentSchema.safeParse({
    ...body,
    start_time: new Date(body.start_time),
    end_time: addMinutes(new Date(body.start_time), body.duration || 30)
  })

  if (!result.success) {
    return new NextResponse('Invalid request data', { status: 400 })
  }

  const supabase = createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Get clinic ID from staff
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  // Create appointment - cast to any to bypass TypeScript strict checking
  const appointmentData = {
    ...result.data,
    clinic_id: (staff as any).clinic_id,
    created_by: user.id
  } as any

  const { data, error } = await (supabase as any)
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (error) {
    return new NextResponse('Failed to create appointment', { status: 500 })
  }

  await writeAuditLog({
    clinicId: (staff as any).clinic_id,
    userId: user.id,
    action: 'create',
    entityType: 'appointment',
    entityId: data.id,
    newValues: {
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      service_id: data.service_id,
      status: data.status,
    },
    request,
  })

  // ── Send booking confirmation via WhatsApp + email (fire-and-forget) ──
  try {
    const { data: fullAppt } = await (supabase as any)
      .from('appointments')
      .select('start_time, patients(full_name, phone, email), services(name, price, duration), clinics(name, phone)')
      .eq('id', data.id)
      .single()

    if (fullAppt) {
      const patient = Array.isArray(fullAppt.patients) ? fullAppt.patients[0] : fullAppt.patients
      const service = Array.isArray(fullAppt.services) ? fullAppt.services[0] : fullAppt.services
      const clinic = Array.isArray(fullAppt.clinics) ? fullAppt.clinics[0] : fullAppt.clinics
      const phone = patient?.phone
      const firstName = (patient?.full_name || 'there').split(' ')[0]
      const clinicName = clinic?.name || 'the clinic'
      const apptDate = format(new Date(fullAppt.start_time), 'EEEE, d MMMM')
      const apptTime = format(new Date(fullAppt.start_time), 'h:mm a')

      if (phone) {
        const waMsg = `Hi ${firstName}! Your appointment at ${clinicName} is confirmed ✅\n\n📅 ${apptDate}\n⏰ ${apptTime}${service ? `\n💊 ${service.name}` : ''}\n\nWe'll send you a reminder before your visit. See you soon!`
        sendWhatsAppMessage(
          (staff as any).clinic_id,
          phone,
          waMsg,
          { type: 'booking_confirmation', appointmentId: data.id, patientId: data.patient_id }
        ).catch((e: any) => console.error('Booking confirmation WhatsApp failed:', e))
      }

      const patientEmail = patient?.email
      if (patientEmail && isEmailConfigured()) {
        const emailData = {
          patientName: patient?.full_name || firstName,
          clinicName,
          appointmentDate: apptDate,
          appointmentTime: apptTime,
          serviceName: service?.name,
          clinicPhone: clinic?.phone,
          bookingRef: data.id.slice(0, 8).toUpperCase(),
        }
        const { subject, html } = bookingConfirmationTemplate(emailData)
        sendEmail({ to: patientEmail, subject, html })
          .catch((e: any) => console.error('Booking confirmation email failed:', e))
      }
    }
  } catch (e) {
    console.error('Failed to send booking confirmation:', e)
  }

  return NextResponse.json(data, { status: 201 })
}