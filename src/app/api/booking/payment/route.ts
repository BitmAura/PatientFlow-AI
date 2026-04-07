/**
 * POST /api/booking/payment
 * Create a Razorpay order for booking deposit
 * 
 * Expected body:
 * {
 *   amount: number (in rupees)
 *   clinic_id: string
 *   service_id: string
 *   patient_name: string
 *   patient_email: string
 *   patient_phone: string
 * }
 */

import { NextResponse } from 'next/server'
import { createPaymentOrder } from '@/services/payment'
import { z } from 'zod'
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

const createPaymentOrderSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  clinic_id: z.string().min(1, 'Clinic ID is required'),
  service_id: z.string().min(1, 'Service ID is required'),
  patient_name: z.string().min(1, 'Patient name is required'),
  patient_email: z.string().email('Invalid email'),
  patient_phone: z.string().min(10, 'Invalid phone number'),
})

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limiter = await checkRateLimitAsync(`booking-payment:${ip}`, 10, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please retry shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limiter.retryAfterSeconds),
            'X-RateLimit-Remaining': String(limiter.remaining),
          },
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = createPaymentOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { amount, clinic_id, service_id, patient_name, patient_email, patient_phone } =
      validation.data

    // Generate unique receipt (clinic_id + timestamp + random)
    const receipt = `clinic_${clinic_id}_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Create order with Razorpay
    const order = await createPaymentOrder({
      amount,
      receipt,
      description: `Booking Deposit - ${patient_name} (${clinic_id})`,
      customer_notify: 1,
      notes: {
        clinic_id,
        service_id,
        patient_email,
        patient_phone,
        patient_name,
      },
    })

    await writeAuditLog({
      clinicId: clinic_id,
      action: 'create',
      entityType: 'payment_order',
      entityId: order.id,
      newValues: {
        amount,
        service_id,
        patient_phone: patient_phone.slice(-4),
      },
      request,
    })

    // Return order details for frontend Razorpay checkout
    return NextResponse.json(
      {
        order_id: order.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        description: `Deposit for booking at clinic`,
        prefill: {
          name: patient_name,
          email: patient_email,
          contact: patient_phone,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Booking Payment] Error creating order:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment order. Please try again.',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
