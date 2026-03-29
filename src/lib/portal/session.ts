import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'

const SESSION_COOKIE = 'portal_session'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production for portal sessions')
    }
    return new TextEncoder().encode('dev-only-jwt-secret')
  }
  return new TextEncoder().encode(secret)
}

function hashOtp(phone: string, otp: string, clinicId: string): string {
  const secret = (process.env.OTP_SECRET || process.env.JWT_SECRET || 'dev-otp-secret').trim()
  return crypto
    .createHmac('sha256', secret)
    .update(`${clinicId}:${phone}:${otp}`)
    .digest('hex')
}

export type PortalSession = {
  patient_id: string
  clinic_id: string
  phone: string
}

export async function createPortalSession(patientId: string, clinicId: string, phone: string) {
  const session: PortalSession = { patient_id: patientId, clinic_id: clinicId, phone }
  const jwtSecret = getJwtSecret()
  
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(jwtSecret)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return token
}

export async function verifyPortalSession(token: string | undefined): Promise<PortalSession | null> {
  if (!token) return null
  try {
    const jwtSecret = getJwtSecret()
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as unknown as PortalSession
  } catch (error) {
    return null
  }
}

export async function clearPortalSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(phone: string, otp: string, clinicId: string) {
  const supabase = createClient() as any
  
  // Store in a dedicated table or redis. For MVP, using a 'patient_otps' table
  // Assuming table exists: patient_otps (phone, otp, expires_at, clinic_id)
  
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 mins
  const otpHash = hashOtp(phone, otp, clinicId)
  
  await supabase.from('patient_otps').upsert({
    phone,
    otp: otpHash,
    expires_at: expiresAt,
    clinic_id: clinicId
  }, { onConflict: 'phone' })
}

export async function verifyOTP(phone: string, otp: string): Promise<{ success: boolean, patient?: any }> {
  const supabase = createClient() as any

  // 1. Check OTP
  const { data: record } = await supabase
    .from('patient_otps')
    .select('*')
    .eq('phone', phone)
    .single()

  if (!record) return { success: false }
  
  if (new Date(record.expires_at) < new Date()) {
    return { success: false } // Expired
  }

  const expectedHash = hashOtp(phone, otp, record.clinic_id)
  if (record.otp !== expectedHash) {
    // Increment failed attempts here
    return { success: false }
  }

  // 2. Get Patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('phone', phone)
    .eq('clinic_id', record.clinic_id)
    .single()

  if (!patient) return { success: false } // Should not happen if flow is correct

  // 3. Cleanup
  await supabase.from('patient_otps').delete().eq('phone', phone)

  return { success: true, patient }
}
