import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) {
    return new NextResponse('Clinic not found', { status: 404 })
  }

  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('status, last_activity_at, session_data')
    .eq('clinic_id', staff.clinic_id)
    .single()

  const sessionData = (connection?.session_data || {}) as Record<string, any>
  const rawStatus = connection?.status || 'disconnected'
  const status = rawStatus === 'active' ? 'connected' : rawStatus
  const rawProvider = String(sessionData.provider || '').toLowerCase()
  const provider =
    rawProvider === 'meta_cloud'
      ? 'meta'
      : rawProvider === 'meta' || rawProvider === 'gupshup'
        ? rawProvider
        : null

  return NextResponse.json({
    connected: status === 'connected',
    status,
    lastActivity: connection?.last_activity_at || null,
    setupMode: sessionData.setup_mode || null,
    phoneNumberId: sessionData.phone_number_id || sessionData.phoneNumberId || null,
    provider
  })
}