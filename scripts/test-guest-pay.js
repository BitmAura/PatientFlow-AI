const fs = require('fs')
const crypto = require('crypto')

// Use global fetch when available (Node 18+). Fallback to node-fetch if needed.
const fetch = globalThis.fetch || (async (...args) => (await import('node-fetch')).default(...args))

function parseEnv(text) {
  const out = {}
  text.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#=]+)=\s*(?:"([^"]*)"|'([^']*)'|([^#]*))?/) // capture quoted or unquoted
    if (m) {
      const key = m[1].trim()
      const val = m[2] ?? m[3] ?? m[4] ?? ''
      out[key] = val.trim()
    }
  })
  return out
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Server did not become ready in time')
}

(async () => {
  try {
    const base = (process.env.TARGET_URL || 'http://localhost:3000').replace(/\/$/, '')

    console.log('Parsing .env.local for Razorpay secret (not printing it)')
    const envText = fs.readFileSync('.env.local', 'utf8')
    const env = parseEnv(envText)

    console.log('Waiting for server at', base)
    await waitForServer(base)
    console.log('Server ready — creating guest order')

    const createResp = await fetch(base + '/api/guest/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Guest', phone: '+919876543210' }),
    })

    const createJson = await createResp.json()
    console.log('create-order status', createResp.status)
    console.log(JSON.stringify({ orderId: createJson.order?.id ?? null, amount: createJson.order?.amount ?? null, leadId: createJson.leadId ?? null }, null, 2))

    const orderId = createJson.order?.id
    const leadId = createJson.leadId || null
    if (!orderId) {
      console.error('No order id returned; aborting test')
      process.exit(1)
    }

    // Create a fake payment id and compute signature using server secret from .env.local
    const paymentId = 'pay_' + Date.now()
    const secret = env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not found in .env.local; aborting')
      process.exit(1)
    }

    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')

    console.log('Calling confirm endpoint with generated payment id')
    const confirmResp = await fetch(base + '/api/guest/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      }),
    })

    const confirmJson = await confirmResp.json()
    console.log('confirm status', confirmResp.status)
    console.log(JSON.stringify(confirmJson, null, 2))
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(2)
  }
})()
