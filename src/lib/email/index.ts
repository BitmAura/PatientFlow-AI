import { Resend } from 'resend'

let _client: Resend | null = null

function getClient(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
    _client = new Resend(apiKey)
  }
  return _client
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getClient()
    const fromAddress = input.from ?? (process.env.EMAIL_FROM ?? 'PatientFlow AI <reminders@auradigitalservices.me>')

    const { data, error } = await client.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    })

    if (error) return { success: false, error: error.message }
    return { success: true, messageId: data?.id }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    return { success: false, error: message }
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}
