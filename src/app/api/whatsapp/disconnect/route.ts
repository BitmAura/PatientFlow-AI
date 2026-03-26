import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // 4. Deregister from BSP (Mock Logic)
  // In a real implementation, this would call the BSP API to remove the number
  console.log(`[WhatsApp Offboarding] Deregistering number for clinic ${clinicId}`)
  // await bspClient.deregisterNumber(clinicId)
  // await bspClient.revokePermissions(clinicId)

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
