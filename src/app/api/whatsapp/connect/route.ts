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
  const phoneNumber = String(body?.phoneNumber || '').trim()

  if (!phoneNumber) {
    return new NextResponse('Phone number is required', { status: 400 })
  }

  const normalizedPhone = phoneNumber.replace(/\s+/g, '')
  if (!normalizedPhone.startsWith('+')) {
    return new NextResponse('Phone number must include country code', { status: 400 })
  }

  const hasMetaDefaults = Boolean(
    process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_NUMBER_ID
  )
  if (!hasMetaDefaults) {
    return NextResponse.json(
      {
        error:
          'Quick setup is unavailable. Configure WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID or use Advanced Setup.',
      },
      { status: 400 }
    )
  }

  const result = await verifyNumber({
    clinicId: staff.clinic_id,
    phoneNumber: normalizedPhone,
    provider: 'meta',
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Failed to start WhatsApp setup' },
      { status: 502 }
    )
  }

  return NextResponse.json({
    connected: true,
    status: 'connected',
    setupMode: 'auto',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || null,
    provider: 'meta',
  })
}
