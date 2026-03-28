import { NextResponse } from 'next/server'
import { verifyOTP, createPortalSession } from '@/lib/portal/session'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const { phone, otp } = await request.json()
  const ip = getClientIp(request)

  const ipLimiter = checkRateLimit(`portal-verify-otp:ip:${ip}`, 30, 60_000)
  if (!ipLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(ipLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(ipLimiter.remaining),
        },
      }
    )
  }

  if (!phone || !otp) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const phoneLimiter = checkRateLimit(`portal-verify-otp:phone:${phone}`, 10, 10 * 60_000)
  if (!phoneLimiter.allowed) {
    return NextResponse.json(
      { error: 'Too many OTP verification attempts for this number.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(phoneLimiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(phoneLimiter.remaining),
        },
      }
    )
  }

  const result = await verifyOTP(phone, otp)

  if (!result.success || !result.patient) {
    await writeAuditLog({
      action: 'otp_verify',
      entityType: 'portal_auth',
      newValues: {
        phone_last4: phone.slice(-4),
        result: 'failed',
      },
      request,
    })

    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
  }

  // Create session
  await createPortalSession(result.patient.id, result.patient.clinic_id, phone)

  await writeAuditLog({
    clinicId: result.patient.clinic_id,
    action: 'otp_verify',
    entityType: 'portal_auth',
    entityId: result.patient.id,
    newValues: {
      phone_last4: phone.slice(-4),
      result: 'success',
    },
    request,
  })

  return NextResponse.json({ success: true, patient: result.patient })
}
