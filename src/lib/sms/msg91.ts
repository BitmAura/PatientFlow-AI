/* ─────────────────────────────────────────────────────────────────
   MSG91 SMS integration
   Docs: https://msg91.com/help/send-single-sms-api
   Used as: WhatsApp fallback + standalone SMS channel
───────────────────────────────────────────────────────────────── */

export interface SendSmsInput {
  to: string          // Indian mobile, 10 digits or +91XXXXXXXXXX
  message: string
  senderId?: string   // 6-char DLT sender ID, defaults to env
}

export interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
}

export function isSmsConfigured(): boolean {
  return Boolean(process.env.MSG91_API_KEY && process.env.MSG91_SENDER_ID)
}

function normalise(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const apiKey = process.env.MSG91_API_KEY
  const senderId = input.senderId ?? process.env.MSG91_SENDER_ID ?? 'PTFLOW'

  if (!apiKey) return { success: false, error: 'MSG91_API_KEY not configured' }

  const mobile = normalise(input.to)
  if (mobile.length < 12) return { success: false, error: `Invalid phone number: ${input.to}` }

  try {
    const body = {
      sender: senderId,
      route: '4',           // transactional route
      country: '91',
      sms: [{ message: input.message, to: [mobile] }],
    }

    const res = await fetch('https://api.msg91.com/api/v2/sendsms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.type === 'success') {
      return { success: true, messageId: data.message }
    }

    return { success: false, error: data.message || `HTTP ${res.status}` }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'SMS send failed' }
  }
}
