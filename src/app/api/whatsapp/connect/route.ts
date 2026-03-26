import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const sessionData = {
    provider: 'meta_cloud',
    setup_mode: 'auto',
    requested_phone: normalizedPhone,
    requested_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('whatsapp_connections')
    .upsert({
      clinic_id: staff.clinic_id,
      status: 'connecting',
      session_data: sessionData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'clinic_id' })

  if (error) {
    return new NextResponse('Failed to start setup', { status: 500 })
  }

  return NextResponse.json({
    connected: false,
    status: 'connecting',
    setupMode: 'auto',
    phoneNumberId: null,
    provider: 'meta_cloud'
  })
}
