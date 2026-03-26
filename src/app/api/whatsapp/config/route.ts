import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('session_data, status')
    .eq('clinic_id', staff.clinic_id)
    .single()

  const sessionData = (connection?.session_data || {}) as Record<string, any>

  return NextResponse.json({
    status: connection?.status || 'disconnected',
    phoneNumberId: sessionData.phone_number_id || '',
    accessToken: sessionData.access_token || '',
    webhookSecret: sessionData.webhook_secret || ''
  })
}

export async function PUT(request: Request) {
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
  const phoneNumberId = String(body?.phoneNumberId || '').trim()
  const accessToken = String(body?.accessToken || '').trim()
  const webhookSecret = String(body?.webhookSecret || '').trim()

  if (!phoneNumberId || !accessToken) {
    return new NextResponse('Phone number ID and access token are required', { status: 400 })
  }

  const sessionData = {
    provider: 'meta_cloud',
    setup_mode: 'manual',
    phone_number_id: phoneNumberId,
    access_token: accessToken,
    webhook_secret: webhookSecret || null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('whatsapp_connections')
    .upsert({
      clinic_id: staff.clinic_id,
      status: 'connected',
      session_data: sessionData,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'clinic_id' })

  if (error) {
    return new NextResponse('Failed to save configuration', { status: 500 })
  }

  return NextResponse.json({
    connected: true,
    status: 'connected',
    phoneNumberId
  })
}
