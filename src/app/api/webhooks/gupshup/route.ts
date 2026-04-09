import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyGupshupWebhookSignature, parseGupshupWebhook } from '@/lib/gupshup/service'
import { updateLastWebhookReceived } from '@/services/gupshup/config'
import { logError } from '@/lib/logger'

/**
 * POST /api/webhooks/gupshup
 * 
 * Receives incoming WhatsApp messages and status updates from Gupshup
 * 
 * Webhook events:
 * 1. Message received: Store in patient_messages, process content
 * 2. Message status: Update communication_logs with delivery status
 * 3. Failed webhook: Log error and return 200 for retry
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-gupshup-signature')

    // 2. Verify webhook signature
    // If GUPSHUP_WEBHOOK_SECRET is set, enforce it strictly.
    // If not set (dev/local), allow through with a warning.
    // In production, secret MUST be set — this is the only guard against spoofed webhooks.
    const webhookSecret = process.env.GUPSHUP_WEBHOOK_SECRET

    if (webhookSecret) {
      // Secret configured — enforce signature on every request
      if (!signature) {
        console.warn('[Webhook] Rejected: missing signature')
        return NextResponse.json({ received: true }, { status: 200 }) // Return 200 so Gupshup doesn't retry
      }
      const isValid = verifyGupshupWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.warn('[Webhook] Rejected: invalid signature — possible spoofing attempt')
        return NextResponse.json({ received: true }, { status: 200 })
      }
    } else {
      // No secret configured — only allow in non-production
      if (process.env.NODE_ENV === 'production') {
        console.error('[Webhook] CRITICAL: GUPSHUP_WEBHOOK_SECRET not set in production. Rejecting all webhook requests.')
        return NextResponse.json({ received: true }, { status: 200 })
      }
      console.warn('[Webhook] WARNING: No GUPSHUP_WEBHOOK_SECRET — skipping signature check (dev only)')
    }

    // 3. Parse payload
    const payload = JSON.parse(rawBody)
    const parsed = parseGupshupWebhook(payload)

    if (parsed.type === 'unknown') {
      console.warn('[Webhook] Failed to parse webhook payload')
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Handle message received event
    if (parsed.type === 'message') {
      await handleIncomingMessage(supabase, parsed.data)
    }
    // 5. Handle message status update event
    else if (parsed.type === 'status') {
      await handleStatusUpdate(supabase, parsed.data)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    await logError('Gupshup webhook processing failed', error as Error, {
      endpoint: '/api/webhooks/gupshup',
    })
    // Return 200 anyway so Gupshup doesn't retry
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

// Keywords that trigger opt-out (case-insensitive, trimmed)
const STOP_KEYWORDS = ['stop', 'unsubscribe', 'opt out', 'optout', 'cancel', 'no more', 'remove me']

function isStopKeyword(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return STOP_KEYWORDS.some((kw) => normalized === kw || normalized.startsWith(kw + ' '))
}

/**
 * Handle incoming message from Gupshup
 */
async function handleIncomingMessage(
  supabase: any,
  data: {
    from: string
    text: string
    messageId: string
    timestamp: number
  }
) {
  try {
    // Gupshup sends the destination (clinic's registered number) in the webhook.
    // We match on phone_number_id which is the clinic's number stored at registration time.
    // However Gupshup may send the clinic number as `to` and sender as `from`.
    // We search all active configs and match the patient sender against their clinic.
    // Strategy: look up patient by phone first, derive clinic from patient record.
    // Fallback: iterate configs isn't scalable — instead we look up all active configs
    // and match by checking which clinic this sender belongs to.

    // 1. Deduplicate early (cross-clinic) using provider_message_id uniqueness
    const { data: existing } = await supabase
      .from('patient_messages')
      .select('id')
      .eq('provider_message_id', data.messageId)
      .maybeSingle()

    if (existing) {
      console.log('[Webhook] Duplicate message, skipping:', data.messageId)
      return
    }

    // 2. Find patient by their phone number (column is `phone`, not `phone_number`)
    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id, whatsapp_opt_in')
      .eq('phone', data.from)
      .maybeSingle()

    // 3. Determine clinic_id — from patient record or from gupshup_config destination
    let clinicId: string | null = patient?.clinic_id ?? null

    if (!clinicId) {
      // Patient not found — still store the message under any matching active config
      // Gupshup webhook payload includes the receiving app's number; we can't easily
      // determine destination from `data.from` (that is the sender). Log and exit gracefully.
      console.warn('[Webhook] Could not determine clinic for inbound message from:', data.from.slice(-4))
      return
    }

    // 4. Handle STOP / opt-out keywords (compliance requirement)
    if (isStopKeyword(data.text)) {
      await supabase
        .from('patients')
        .update({ whatsapp_opt_in: false, lifecycle_stage: 'opted_out' })
        .eq('id', patient.id)

      // Cancel any pending recalls for this patient
      await supabase
        .from('patient_recalls')
        .update({ status: 'cancelled', notes: 'Patient sent STOP via WhatsApp' })
        .eq('clinic_id', clinicId)
        .eq('patient_id', patient.id)
        .eq('status', 'pending')

      console.log('[Webhook] Patient opted out via STOP keyword:', patient.id)
    }

    // 5. Store message in patient_messages table
    const { error: insertError } = await supabase
      .from('patient_messages')
      .insert({
        clinic_id: clinicId,
        patient_id: patient?.id ?? null,
        phone_number: data.from,
        content: data.text,
        provider: 'gupshup',
        provider_message_id: data.messageId,
        message_type: 'text',
        raw_payload: null,
        status: 'received',
        received_at: new Date(data.timestamp * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('[Webhook] Failed to store message:', insertError)
      return
    }

    // 6. Update last_webhook_received_at on the clinic's gupshup_config
    await updateLastWebhookReceived(clinicId)

    console.log('[Webhook] ✅ Message stored:', {
      clinic: clinicId,
      from: data.from.slice(-4),
      messageId: data.messageId,
      optOut: isStopKeyword(data.text),
    })
  } catch (error) {
    console.error('[Webhook] Error handling incoming message:', error)
  }
}

/**
 * Handle message status update from Gupshup (delivered, read, failed, etc.)
 * Updates the outbound reminder_logs row that carries the Gupshup message_id.
 */
async function handleStatusUpdate(
  supabase: any,
  data: {
    messageId: string
    status: string
    timestamp: number
  }
) {
  try {
    // reminder_logs stores outbound messages with column `message_id`
    const { data: log } = await supabase
      .from('reminder_logs')
      .select('id')
      .eq('message_id', data.messageId)
      .maybeSingle()

    if (!log) {
      // Not found — could be a message we didn't log (e.g. manual sends), silently skip
      return
    }

    const statusMap: Record<string, string> = {
      submitted: 'sent',
      delivered: 'delivered',
      read: 'delivered', // treat read as delivered
      failed: 'failed',
      rejected: 'failed',
    }

    const ourStatus = statusMap[data.status] ?? data.status

    await supabase
      .from('reminder_logs')
      .update({ status: ourStatus })
      .eq('id', log.id)

    console.log('[Webhook] ✅ Delivery status updated:', {
      messageId: data.messageId,
      status: ourStatus,
    })
  } catch (error) {
    console.error('[Webhook] Error handling status update:', error)
  }
}

