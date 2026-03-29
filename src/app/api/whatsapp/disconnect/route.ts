import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WhatsAppProviderFactory } from '@/lib/whatsapp/provider-factory'
import { gupshupConfig } from '@/config/gupshup'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // 1. Get Clinic
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  // 2. Get Reason
  let reason = 'User requested disconnection'
  try {
    const body = await request.json()
    if (body.reason) reason = body.reason
  } catch (e) {
    // Body is optional
  }

  const clinicId = staff.clinic_id

  // 3. Pause Automation (Journeys)
  // Lock all active journeys to prevent further processing
  // This ensures no state transitions occur even if the cron job runs
  await supabase
    .from('patient_journeys')
    .update({ 
      automation_locked: true,
      automation_locked_at: new Date().toISOString()
    } as any)
    .eq('clinic_id', clinicId)
    .eq('status', 'active')

  // 4. Deregister from provider (best effort)
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('session_data')
    .eq('clinic_id', clinicId)
    .single()

  const phoneNumber =
    connection?.session_data?.phoneNumber ||
    connection?.session_data?.verified_number ||
    connection?.session_data?.phone_number ||
    ''

  if (phoneNumber) {
    try {
      const provider = WhatsAppProviderFactory.getProvider('gupshup')
      await provider.deregisterNumber(phoneNumber, {
        apiKey: gupshupConfig.appToken,
        appId: gupshupConfig.appId,
      })
    } catch (error) {
      console.error('[WhatsApp Offboarding] Deregistration failed:', error)
    }
  }

  // 5. Update System State
  const { error } = await supabase
    .from('whatsapp_connections')
    .update({ 
      status: 'disconnected', 
      offboarded_at: new Date().toISOString(),
      offboarding_reason: reason,
      updated_at: new Date().toISOString(),
      // Clear sensitive session data to ensure no further usage
      session_data: {} 
    } as any)
    .eq('clinic_id', clinicId)

  if (error) {
    console.error('Failed to disconnect WhatsApp:', error)
    return new NextResponse('Failed to disconnect', { status: 500 })
  }

  return NextResponse.json({
    connected: false,
    status: 'disconnected',
    message: 'WhatsApp disconnected and automation paused.'
  })
}
