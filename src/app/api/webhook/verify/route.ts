import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/razorpay/subscriptions'

/**
 * POST /api/webhook/verify
 * Test-only endpoint: verifies Razorpay signature and echoes parsed event.
 * This endpoint performs NO DB writes and is safe for local testing.
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'RAZORPAY_WEBHOOK_SECRET not configured' }, { status: 500 })
    }

    const ok = verifyWebhookSignature(raw, signature as string, secret)
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

    const parsed = parseWebhookEvent(JSON.parse(raw))
    return NextResponse.json({ ok: true, parsed })
  } catch (err) {
    console.error('verify webhook error', err)
    return NextResponse.json({ error: 'processing error' }, { status: 500 })
  }
}
