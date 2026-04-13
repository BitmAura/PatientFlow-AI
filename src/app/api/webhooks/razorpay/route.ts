/**
 * POST /api/webhooks/razorpay  ← CANONICAL RAZORPAY WEBHOOK URL
 * Configure this URL in Razorpay Dashboard → Webhooks.
 * The legacy /api/webhook route is kept for backwards compatibility only.
 *
 * Events handled:
 * - payment.authorized / payment.captured / payment.failed
 * - subscription.* — delegated to handleSubscriptionWebhook (shared service)
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit'
import { handleSubscriptionWebhook } from '@/lib/services/subscription'
import { writeAuditLog } from '@/lib/audit/log'

// Types for Razorpay webhook payload
interface RazorpayPaymentEntity {
  id: string
  entity: string
  amount: number
  currency: string
  status: 'authorized' | 'failed' | 'captured'
  method: string
  description?: string
  order_id?: string
  notes?: Record<string, string>
  error_code?: string
  error_description?: string
}

interface RazorpayWebhookPayload {
  event: string
  created_at: number
  payload?: {
    payment?: {
      entity: RazorpayPaymentEntity
    }
    subscription?: {
      entity: Record<string, unknown>
    }
  }
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured')
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  const isValid = expectedSignature === signature

  if (!isValid) {
    console.warn('[Razorpay Webhook] Signature mismatch', {
      provided: signature,
      expected: expectedSignature,
    })
  }

  return isValid
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payment: RazorpayPaymentEntity) {
  console.log('[Razorpay Webhook] Payment authorized:', payment.id)
  // Most payment methods are automatically captured, so this is usually a no-op
  // For manual capture methods, you might want to auto-capture here
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payment: RazorpayPaymentEntity) {
  try {
    console.log('[Razorpay Webhook] Payment captured:', payment.id, 'Amount:', payment.amount)

    // If payment has appointment notes, we could update appointment status
    // This is optional since the confirm endpoint already checks payment status
    if (payment.notes?.clinic_id && payment.order_id) {
      const supabase = createClient()

      // Find appointment with matching deposit_payment_id
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('id, deposit_status')
        .eq('clinic_id', payment.notes.clinic_id as string)
        .eq('deposit_payment_id', payment.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Razorpay Webhook] Error fetching appointment:', fetchError)
        return
      }

      if (appointment && (appointment as any).deposit_status !== 'paid') {
        // Update appointment to mark deposit as paid
        await (supabase as any)
          .from('appointments')
          .update({ deposit_status: 'paid' })
          .eq('id', (appointment as any).id)

        console.log('[Razorpay Webhook] Updated appointment deposit status:', (appointment as any).id)
      }
    }
  } catch (error) {
    console.error('[Razorpay Webhook] Error handling payment.captured:', error)
    // Don't throw - webhook handler should be resilient
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment: RazorpayPaymentEntity) {
  console.warn('[Razorpay Webhook] Payment failed:', payment.id, {
    error_code: payment.error_code,
    error_description: payment.error_description,
  })

  // Optionally send notification to customer or update logs
  // For now, just log it - the appointment won't be confirmed until payment succeeds
}


export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const limiter = await checkRateLimitAsync(`webhook-razorpay:${ip}`, 120, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many webhook requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limiter.retryAfterSeconds),
          },
        }
      )
    }

    // Read body as text for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing signature header')
      await writeAuditLog({
        action: 'webhook_rejected',
        entityType: 'razorpay_webhook',
        newValues: {
          reason: 'missing_signature',
        },
        request,
      })
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('[Razorpay Webhook] Invalid signature')
      await writeAuditLog({
        action: 'webhook_rejected',
        entityType: 'razorpay_webhook',
        newValues: {
          reason: 'invalid_signature',
        },
        request,
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    const payload: RazorpayWebhookPayload = JSON.parse(body)

    await writeAuditLog({
      action: 'webhook_received',
      entityType: 'razorpay_webhook',
      entityId: payload.payload?.payment?.entity?.id || null,
      newValues: {
        event: payload.event,
      },
      request,
    })

    console.log('[Razorpay Webhook] Received event:', payload.event)

    // Route to appropriate handler
    switch (payload.event) {
      case 'payment.authorized':
        if (payload.payload?.payment?.entity) {
          await handlePaymentAuthorized(payload.payload.payment.entity)
        }
        break

      case 'payment.captured':
        if (payload.payload?.payment?.entity) {
          await handlePaymentCaptured(payload.payload.payment.entity)
        }
        break

      case 'payment.failed':
        if (payload.payload?.payment?.entity) {
          await handlePaymentFailed(payload.payload.payment.entity)
        }
        break

      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.completed':
      case 'subscription.halted':
      case 'subscription.resumed':
      case 'subscription.pending':
      case 'subscription.cancelled':
        // Delegate to the shared subscription service (same logic as /api/webhook)
        await handleSubscriptionWebhook(payload)
        break

      default:
        console.log('[Razorpay Webhook] Unhandled event:', payload.event)
    }

    // Always return 200 to Razorpay (webhook is idempotent)
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Razorpay Webhook] Error processing webhook:', error)
    await writeAuditLog({
      action: 'webhook_error',
      entityType: 'razorpay_webhook',
      newValues: {
        message: error instanceof Error ? error.message : String(error),
      },
      request,
    })
    // Return 200 anyway to prevent Razorpay retries for processing errors
    return NextResponse.json(
      { received: true, error: 'Processing error' },
      { status: 200 }
    )
  }
}
