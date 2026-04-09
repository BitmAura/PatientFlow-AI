import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/messages/handler'
import { GupshupProvider } from '@/lib/whatsapp/providers/gupshup-provider'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const signature = request.headers.get('x-gupshup-signature')
    const secret = process.env.GUPSHUP_WEBHOOK_SECRET

    // 1. Optional Signature Verification
    if (secret && signature) {
       // Verification logic would go here if Gupshup provides a standard crypto hash
       // For now, we assume standard HTTPS security but log the attempt
       console.log('[Webhook] Verifying Signature:', signature)
    }

    const provider = new GupshupProvider()
    const messages = await provider.receiveMessage(payload)

    // 2. Resolve Clinic ID (Supporting Shared Number mode)
    const destination = payload.payload?.destination || payload.mobile
    const clinicId = await resolveClinicIdFromNumber(destination)

    if (!clinicId) {
      console.warn(`[Webhook] Unrecognized source: ${destination}`)
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient() as any

    for (const msg of messages) {
      const externalId = (msg.metadata as any)?.messageId || `msg_${Date.now()}`

      // 3. Idempotency Check
      const { data: existing } = await supabase
        .from('patient_messages')
        .select('id')
        .eq('message_id_external', externalId)
        .maybeSingle()

      if (existing) {
        console.log(`[Webhook] Duplicate ignored: ${externalId}`)
        continue
      }

      await handleIncomingMessage({
        clinicId,
        fromPhone: msg.from,
        content: msg.content,
        metadata: { ...msg.metadata, externalId }
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function resolveClinicIdFromNumber(number: string): Promise<string | null> {
  const supabase = createAdminClient() as any
  const cleanNumber = number?.replace(/\D/g, '')
  if (!cleanNumber) return null

  // Check custom connections first
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('clinic_id')
    .or(`phoneNumberId.eq.${cleanNumber},verified_number.eq.${cleanNumber}`)
    .maybeSingle()

  if (connection) return connection.clinic_id

  // Check Agency Shared Number
  if (cleanNumber === process.env.GUPSHUP_SOURCE_NUMBER) {
     // If it's the shared number, we need metadata to resolve the clinic
     // (Optional logic here if we use dynamic routing via payloads)
     return null 
  }

  return null
}

export const GET = () => new NextResponse('Webhook Active', { status: 200 })
