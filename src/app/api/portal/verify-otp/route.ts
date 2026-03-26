import { NextResponse } from 'next/server'
import { verifyOTP, createPortalSession } from '@/lib/portal/session'

export async function POST(request: Request) {
  const { phone, otp } = await request.json()

  if (!phone || !otp) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const result = await verifyOTP(phone, otp)

  if (!result.success || !result.patient) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
  }

  // Create session
  await createPortalSession(result.patient.id, result.patient.clinic_id, phone)

  return NextResponse.json({ success: true, patient: result.patient })
}
