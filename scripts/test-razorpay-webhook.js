const crypto = require('crypto')

// Use global fetch when available (Node 18+). Avoid requiring node-fetch so tests work locally.
const fetch = globalThis.fetch || (async (...args) => (await import('node-fetch')).default(...args))

// Usage:
// RAZORPAY_WEBHOOK_SECRET=your_secret TARGET_URL=https://.../api/webhook node scripts/test-razorpay-webhook.js

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET
if (!WEBHOOK_SECRET) {
  console.error('Set RAZORPAY_WEBHOOK_SECRET env var for test')
  process.exit(1)
}

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000/api/webhook'

const payload = {
  event: 'subscription.activated',
  payload: {
    subscription: {
      entity: {
        id: 'test_sub_xxx',
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        customer_id: 'test_cust_xxx',
        notes: { userId: '00000000-0000-0000-0000-000000000000', plan: 'starter' }
      }
    }
  }
}

const body = JSON.stringify(payload)
const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')

;(async () => {
  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
    })
    console.log('status', res.status)
    console.log(await res.text())
  } catch (err) {
    console.error(err)
  }
})()
