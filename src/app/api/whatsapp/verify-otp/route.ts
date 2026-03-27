import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyNumber } from '@/services/messaging'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const body = await request.json()
  const { phone_number, otp } = body

  if (!phone_number || !otp) {
    return new NextResponse('Phone number and OTP are required', { status: 400 })
  }

  const result = await verifyNumber({
    clinicId: staff.clinic_id,
    phoneNumber: phone_number,
    otp,
  })

  if (result.success) {
    return NextResponse.json({
      success: true,
      status: result.status,
      provider: result.provider,
      message: 'WhatsApp number verified and activated'
    })
  } else {
    // 5. Failure Flow
    return NextResponse.json({
      success: false,
      error: result.error || 'OTP Verification Failed',
      message: 'Invalid OTP or expired'
    }, { status: 400 })
  }
}
