import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOTP, storeOTP } from '@/lib/portal/session'

// Since this is a public route, we need to know which clinic context we are in.
// Ideally, the portal URL is clinic-specific (e.g. portal.app.com/clinic-slug)
// OR the user selects a clinic.
// For this MVP, we will assume the phone number is unique across the system OR just pick the first match.
// Let's assume phone number + clinic ID is unique, but here we only have phone.
// We'll search for the patient across all clinics (or a specific one if provided in body/headers).

export async function POST(request: Request) {
  const { phone } = await request.json()
  
  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
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
    // Security: Don't reveal if user exists, but for MVP we might need to debug
    // Return success to prevent enumeration, but don't send OTP
    return NextResponse.json({ success: true, expires_in: 300 }) 
  }

  const otp = generateOTP()
  await storeOTP(phone, otp, patient.clinic_id)

  // Send via WhatsApp (Mock for now, replace with real provider)
  console.log(`[OTP] Sending ${otp} to ${phone}`)
  
  // In prod: await sendWhatsApp(phone, `Your login OTP is ${otp}`)

  return NextResponse.json({ success: true, expires_in: 300 })
}
