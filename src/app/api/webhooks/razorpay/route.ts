import { NextResponse } from 'next/server'
import { handleSubscriptionWebhook } from '@/lib/services/subscription'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text() // Read as text for signature verification
  const signature = request.headers.get('x-razorpay-signature')

  if (!signature) {
    return new NextResponse('Missing signature', { status: 400 })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)
  await handleSubscriptionWebhook(event)

  return NextResponse.json({ received: true })
}
