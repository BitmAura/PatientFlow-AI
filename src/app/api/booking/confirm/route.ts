/**
 * POST /api/booking/confirm
 * Confirm a booking with payment verification
 * 
 * Expected body:
 * {
 *   clinic_id: uuid
 *   service_id: uuid
 *   date: YYYY-MM-DD
 *   time: HH:mm
 *   patient: { name, phone, email, notes }
 *   payment_id: string
 *   order_id: string
 *   razorpay_signature: string
 * }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmBookingSchema } from '@/lib/validations/booking'
import { getPaymentDetails, verifyPaymentSignature, isPaymentSuccessful } from '@/services/payment'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

// Extended schema with payment details
const confirmBookingWithPaymentSchema = confirmBookingSchema.extend({
  order_id: z.string().min(1, 'Order ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
  payment_id: z.string().min(1, 'Payment ID is required'),
  deposit_amount: z.number().positive('Deposit amount must be greater than 0'),
})

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limiter = checkRateLimit(`booking-confirm:${ip}`, 6, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many booking confirmation attempts. Please retry shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limiter.retryAfterSeconds),
            'X-RateLimit-Remaining': String(limiter.remaining),
          },
        }
      )
    }

    const supabase = createClient()
    const body = await request.json()

    // First validate basic booking schema
    const baseValidation = confirmBookingSchema.safeParse(body)
    if (!baseValidation.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: baseValidation.error.errors },
        { status: 400 }
      )
    }

    const { clinic_id, service_id, date, time, patient, doctor_id } = baseValidation.data

    // 1. Get service to check deposit requirement
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration, deposit_required, deposit_amount')
      .eq('id', service_id)
      .eq('clinic_id', clinic_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found or does not belong to this clinic' },
        { status: 404 }
      )
    }

    // 2. Verify payment if deposit is required
    if ((service as any).deposit_required && (service as any).deposit_amount > 0) {
      // Validate payment fields
      const paymentValidation = confirmBookingWithPaymentSchema.safeParse(body)
      if (!paymentValidation.success) {
        return NextResponse.json(
          { error: 'Payment information is required for this service', details: paymentValidation.error.errors },
          { status: 400 }
        )
      }

      const { order_id, razorpay_signature, payment_id, deposit_amount } = paymentValidation.data

      // Verify signature to prevent tampering
      try {
        const signatureVerification = verifyPaymentSignature(order_id, payment_id, razorpay_signature)

        if (!signatureVerification.verified) {
          console.warn('[Booking Confirm] Signature verification failed', {
            clinic_id,
            payment_id,
            order_id,
          })
          return NextResponse.json(
            { error: 'Payment verification failed. Please contact support if you see this.' },
            { status: 400 }
          )
        }
      } catch (sigError) {
        console.error('[Booking Confirm] Signature verification error:', sigError)
        return NextResponse.json(
          { error: 'Failed to verify payment signature' },
          { status: 500 }
        )
      }

      // Fetch actual payment details from Razorpay
      let payment
      try {
        payment = await getPaymentDetails(payment_id)
      } catch (paymentError) {
        console.error('[Booking Confirm] Failed to fetch payment:', paymentError)
        return NextResponse.json(
          { error: 'Failed to verify payment status. Please contact support.' },
          { status: 500 }
        )
      }

      // Verify payment is successful
      if (!isPaymentSuccessful(payment)) {
        console.warn('[Booking Confirm] Payment not successful', {
          payment_id,
          status: payment.status,
          clinic_id,
        })
        return NextResponse.json(
          { error: 'Payment was not completed successfully. Please try again.' },
          { status: 400 }
        )
      }

      // Verify amount matches (safety check for tampering)
      if (payment.amount !== deposit_amount * 100) {
        // Using *100 because Razorpay stores in paise
        console.warn('[Booking Confirm] Payment amount mismatch', {
          expected: deposit_amount * 100,
          received: payment.amount,
          payment_id,
        })
        return NextResponse.json(
          { error: 'Payment amount does not match. Please contact support.' },
          { status: 400 }
        )
      }
    }

    // 3. Find or Create Patient
    const { data: existingPatient } = await supabase
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
        email: patient.email || null,
        notes: patient.notes || null,
      }

      const { data: newPatient, error: createError } = await (supabase as any)
        .from('patients')
        .insert(patientData)
        .select('id')
        .single()

      if (createError || !newPatient) {
        console.error('[Booking Confirm] Failed to create patient:', createError)
        return NextResponse.json(
          { error: 'Failed to create patient record' },
          { status: 500 }
        )
      }

      patientId = (newPatient as any).id
    }

    // 4. Create Appointment
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    const endTime = new Date(startTime.getTime() + ((service as any).duration || 30) * 60000)

    const appointmentData = {
      clinic_id,
      patient_id: patientId,
      service_id,
      doctor_id: doctor_id || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      notes: patient.notes || null,
      source: 'online_booking',
      deposit_status: (service as any).deposit_required ? 'paid' : null,
      deposit_payment_id: body.payment_id || null,
      confirmation_sent: false,
    }

    const { data: appointment, error: apptError } = await (supabase as any)
      .from('appointments')
      .insert(appointmentData)
      .select('*')
      .single()

    if (apptError || !appointment) {
      console.error('[Booking Confirm] Failed to create appointment:', apptError)
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    await writeAuditLog({
      clinicId: clinic_id,
      action: 'create',
      entityType: 'appointment',
      entityId: (appointment as any).id,
      newValues: {
        patient_id: patientId,
        service_id,
        doctor_id: doctor_id || null,
        source: 'online_booking',
      },
      request,
    })

    // 5. Send confirmation (async - don't wait)
    // TODO: Trigger WhatsApp confirmation message via automation service
    // triggerAutomation({ type: 'appointment.booked_online', ... })

    return NextResponse.json(
      {
        success: true,
        appointment_id: (appointment as any).id,
        patient_id: patientId,
        message: 'Appointment confirmed! You will receive a confirmation message shortly.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Booking Confirm] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again or contact support.',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}