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

    if (!signature) {
      console.warn('[Webhook] Missing signature header')
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // 2. Verify webhook signature
    const webhookSecret = process.env.GUPSHUP_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.warn('[Webhook] GUPSHUP_WEBHOOK_SECRET not configured')
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const isValid = verifyGupshupWebhookSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      console.warn('[Webhook] Invalid signature - possible spoofing attempt')
      return NextResponse.json({ received: true }, { status: 200 })
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
    // Find clinic by phone_number_id (matching the registered number)
    const { data: config } = await supabase
      .from('gupshup_config')
      .select('clinic_id')
      .eq('phone_number_id', data.from)
      .single()

    if (!config) {
      console.warn('[Webhook] No clinic found for phone:', data.from)
      return
    }

    const clinicId = config.clinic_id

    // Check for duplicate message (deduplication by provider_message_id)
    const { data: existing } = await supabase
      .from('patient_messages')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('provider_message_id', data.messageId)
      .maybeSingle()

    if (existing) {
      console.log('[Webhook] Duplicate message, skipping:', data.messageId)
      return
    }

    // Find patient by phone number
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone_number', data.from)
      .maybeSingle()

    // Store message in patient_messages table
    const { error: insertError } = await supabase
      .from('patient_messages')
      .insert({
        clinic_id: clinicId,
        patient_id: patient?.id || null,
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

    // Update last_webhook_received_at timestamp
    await updateLastWebhookReceived(clinicId)

    console.log('[Webhook] ✅ Message stored:', {
      clinic: clinicId,
      from: data.from.slice(-4),
      messageId: data.messageId,
    })

    // TODO: Add message processing here
    // - AI intent detection
    // - Auto-response based on intent
    // - Patient threading
  } catch (error) {
    console.error('[Webhook] Error handling incoming message:', error)
  }
}

/**
 * Handle message status update from Gupshup
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
    // Find the message in communication_logs
    const { data: log } = await supabase
      .from('communication_logs')
      .select('id, clinic_id')
      .eq('provider_message_id', data.messageId)
      .maybeSingle()

    if (!log) {
      console.warn('[Webhook] Message not found for status update:', data.messageId)
      return
    }

    // Map Gupshup status to our status
    const statusMap: { [key: string]: string } = {
      submitted: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
      rejected: 'failed',
    }

    const ourStatus = statusMap[data.status] || data.status

    // Update communication log
    const { error: updateError } = await supabase
      .from('communication_logs')
      .update({
        status: ourStatus,
        delivered_at: ['delivered', 'read'].includes(ourStatus)
          ? new Date(data.timestamp * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', log.id)

    if (updateError) {
      console.error('[Webhook] Failed to update status:', updateError)
      return
    }

    console.log('[Webhook] ✅ Status updated:', {
      messageId: data.messageId,
      status: ourStatus,
    })
  } catch (error) {
    console.error('[Webhook] Error handling status update:', error)
  }
}

