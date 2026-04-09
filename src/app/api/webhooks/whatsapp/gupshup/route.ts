import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/messages/handler'
import { GupshupProvider } from '@/lib/whatsapp/providers/gupshup-provider'

/**
 * Gupshup Webhook Handler
 * 🚀 Purpose: Process incoming WhatsApp messages and interactive button clicks.
 * Format: https://docs.gupshup.io/reference/webhook-received-interactive-message
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log('[Webhook] Gupshup Incoming:', JSON.stringify(payload, null, 2))

    // 1. Initialize Gupshup Provider to parse the specific payload format
    const provider = new GupshupProvider()
    const messages = await provider.receiveMessage(payload)

    // 2. Extract Clinic ID
    // Note: Gupshup webhooks usually send to a central URL. 
    // We match the 'destination' (clinics number) to find the clinic_id.
    const destination = payload.payload?.destination || payload.mobile
    
    // For now, we expect the webhook setup to be per-clinic or we perform a lookup.
    // In our architecture, the 'gupshup_config' table maps source numbers to clinics.
    const clinicId = await resolveClinicIdFromNumber(destination)

    if (!clinicId) {
      console.warn(`[Webhook] Could not resolve clinic for number: ${destination}`)
      return NextResponse.json({ received: true }) // Still return 200 to Gupshup
    }

    // 3. Process standard messages and button replies
    for (const msg of messages) {
      await handleIncomingMessage({
        clinicId,
        fromPhone: msg.from,
        content: msg.content, // This contains the ID for button replies thanks to our provider update
        metadata: msg.metadata
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Gupshup Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function resolveClinicIdFromNumber(number: string): Promise<string | null> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient() as any
  
  // Clean number for lookup
  const cleanNumber = number?.replace(/\D/g, '')
  if (!cleanNumber) return null

  const { data } = await supabase
    .from('whatsapp_connections')
    .select('clinic_id')
    .or(`phoneNumberId.eq.${cleanNumber},verified_number.eq.${cleanNumber}`)
    .maybeSingle()

  return data?.clinic_id || null
}

export const GET = () => new NextResponse('Webhook Active', { status: 200 })
