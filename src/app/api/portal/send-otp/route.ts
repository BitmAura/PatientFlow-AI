import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOTP, storeOTP } from '@/lib/portal/session'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'
import { sendMessage } from '@/services/messaging'

// Since this is a public route, we need to know which clinic context we are in.
// Ideally, the portal URL is clinic-specific (e.g. portal.app.com/clinic-slug)
// OR the user selects a clinic.
// For this MVP, we will assume the phone number is unique across the system OR just pick the first match.
// Let's assume phone number + clinic ID is unique, but here we only have phone.
// We'll search for the patient across all clinics (or a specific one if provided in body/headers).

export async function POST(request: Request) {
  const { phone } = await request.json()
  const ip = getClientIp(request)

  const ipLimiter = checkRateLimit(`portal-send-otp:ip:${ip}`, 20, 60_000)
  if (!ipLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many OTP requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(ipLimiter.remaining),
        },
      }
    )
  }
  
  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const phoneLimiter = checkRateLimit(`portal-send-otp:phone:${phone}`, 5, 10 * 60_000)
  if (!phoneLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many OTP requests for this number. Please wait before retrying.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(phoneLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(phoneLimiter.remaining),
        },
      }
    )
  }

  const supabase = createClient() as any
  
  // Find patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, clinic_id')
    .eq('phone', phone)
    .limit(1)
    .single()

  if (!patient) {
    await writeAuditLog({
      action: 'otp_send_attempt',
      entityType: 'portal_auth',
      newValues: {
        phone_last4: phone.slice(-4),
        result: 'patient_not_found',
      },
      request,
    })

    // Security: Don't reveal if user exists, but for MVP we might need to debug
    // Return success to prevent enumeration, but don't send OTP
    return NextResponse.json({ success: true, expires_in: 300 }) 
  }

  const otp = generateOTP()
  await storeOTP(phone, otp, patient.clinic_id)

  const delivery = await sendMessage({
    clinicId: patient.clinic_id,
    to: phone,
    content: `Your PatientFlow login OTP is ${otp}. It expires in 5 minutes.`,
    metadata: {
      type: 'portal_otp',
      patient_id: patient.id,
    },
  })

  if (!delivery.success) {
    await writeAuditLog({
      clinicId: patient.clinic_id,
      action: 'otp_send_failed',
      entityType: 'portal_auth',
      entityId: patient.id,
      newValues: {
        phone_last4: phone.slice(-4),
        provider: delivery.provider,
        error: delivery.error || 'delivery_failed',
      },
      request,
    })

    return NextResponse.json(
      { error: 'Unable to deliver OTP right now. Please try again.' },
      { status: 502 }
    )
  }

  await writeAuditLog({
    clinicId: patient.clinic_id,
    action: 'otp_send',
    entityType: 'portal_auth',
    entityId: patient.id,
    newValues: {
      phone_last4: phone.slice(-4),
      channel: 'whatsapp',
      provider: delivery.provider,
      message_id: delivery.messageId || null,
    },
    request,
  })

  return NextResponse.json({ success: true, expires_in: 300 })
}
