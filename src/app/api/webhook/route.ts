import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/razorpay/subscriptions'
import { handleSubscriptionWebhook } from '@/lib/services/subscription'

/**
 * POST /api/webhook
 * Generic Razorpay webhook receiver (server-only). Verifies HMAC and delegates to subscription service.
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const valid = verifyWebhookSignature(raw, signature as string, secret)
    if (!valid) {
      console.warn('Invalid Razorpay webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(raw)

    // Delegate to subscription service which updates Supabase using admin client
    await handleSubscriptionWebhook(event)

    // Acknowledge
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}
