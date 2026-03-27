import {
  ClinicMessagingConfig,
  IncomingProviderMessage,
  IncomingProviderStatus,
  MessagingProvider,
  ReceiveWebhookResult,
  SendMessageInput,
  SendMessageResult,
  VerifyNumberResult,
} from '@/services/messaging/types'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export class MetaMessagingProvider implements MessagingProvider {
  readonly type = 'meta' as const

  async sendMessage(config: ClinicMessagingConfig, input: SendMessageInput): Promise<SendMessageResult> {
    const token = config.accessToken || process.env.WHATSAPP_API_KEY
    const phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID
    const apiBase = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0'

    if (!token || !phoneNumberId) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: 'Missing Meta API credentials',
      }
    }

    try {
      const response = await fetch(`${apiBase}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizePhone(input.to),
          type: 'text',
          text: { body: input.content },
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return {
          success: false,
          provider: this.type,
          status: 'failed',
          error: String((data as Record<string, unknown>).error || response.statusText),
          raw: data,
        }
      }

      const top = Array.isArray((data as Record<string, unknown>).messages)
        ? ((data as Record<string, unknown>).messages as Array<Record<string, unknown>>)[0]
        : undefined
      const messageId = String(top?.id || `meta_${Date.now()}`)
      return { success: true, provider: this.type, status: 'sent', messageId, raw: data }
    } catch (error) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Meta send failed',
      }
    }
  }

  async receiveWebhook(payload: unknown): Promise<ReceiveWebhookResult> {
    const root = asRecord(payload)
    const entries = Array.isArray(root.entry) ? (root.entry as unknown[]) : []
    const messages: IncomingProviderMessage[] = []
    const statuses: IncomingProviderStatus[] = []

    for (const entry of entries) {
      const e = asRecord(entry)
      const changes = Array.isArray(e.changes) ? (e.changes as unknown[]) : []
      for (const change of changes) {
        const c = asRecord(change)
        const value = asRecord(c.value)
        const metadata = asRecord(value.metadata)
        const to = String(metadata.display_phone_number || metadata.phone_number_id || '')

        const msgItems = Array.isArray(value.messages) ? (value.messages as unknown[]) : []
        for (const item of msgItems) {
          const msg = asRecord(item)
          const text = asRecord(msg.text)
          messages.push({
            from: String(msg.from || ''),
            to,
            content: String(text.body || ''),
            messageId: String(msg.id || `meta_in_${Date.now()}`),
            timestamp: new Date(Number(msg.timestamp || Date.now()) * 1000).toISOString(),
            provider: this.type,
            raw: payload,
          })
        }

        const statusItems = Array.isArray(value.statuses) ? (value.statuses as unknown[]) : []
        for (const item of statusItems) {
          const status = asRecord(item)
          const state = String(status.status || 'sent').toLowerCase()
          statuses.push({
            messageId: String(status.id || ''),
            status: state === 'failed' ? 'failed' : state === 'read' ? 'read' : state === 'delivered' ? 'delivered' : 'sent',
            provider: this.type,
            raw: payload,
          })
        }
      }
    }

    return { messages, statuses }
  }

  async initiateVerification(): Promise<VerifyNumberResult> {
    return {
      success: true,
      provider: this.type,
      status: 'connected',
      message: 'Meta provider does not require OTP in this flow',
    }
  }

  async verifyOtp(): Promise<VerifyNumberResult> {
    return {
      success: true,
      provider: this.type,
      status: 'connected',
      message: 'Meta provider does not require OTP in this flow',
    }
  }
}
