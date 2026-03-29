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

  const { data: existingConfig } = await supabase
    .from('whatsapp_configs')
    .select('phone_number')
    .eq('clinic_id', staff.clinic_id)
    .maybeSingle()

  const { data: existingConnection } = await supabase
    .from('whatsapp_connections')
    .select('session_data')
    .eq('clinic_id', staff.clinic_id)
    .maybeSingle()

  const existingSession = (existingConnection?.session_data || {}) as Record<string, any>

  const sessionData = {
    ...existingSession,
    provider: 'meta',
    setup_mode: 'manual',
    phone_number_id: phoneNumberId,
    phoneNumberId,
    access_token: accessToken,
    accessToken,
    webhook_secret: webhookSecret || null,
    webhookSecret: webhookSecret || null,
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

  const { error: configError } = await supabase
    .from('whatsapp_configs')
    .upsert(
      {
        clinic_id: staff.clinic_id,
        provider: 'meta',
        phone_number: existingConfig?.phone_number || String(existingSession.phone_number || ''),
        credentials: {
          phoneNumberId,
          accessToken,
          webhookSecret: webhookSecret || null,
        },
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clinic_id' }
    )

  if (configError) {
    return new NextResponse('Failed to persist provider configuration', { status: 500 })
  }

  return NextResponse.json({
    connected: true,
    status: 'connected',
    phoneNumberId,
    provider: 'meta',
  })
}
