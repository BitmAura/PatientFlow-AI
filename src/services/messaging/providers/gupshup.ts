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

export class GupshupMessagingProvider implements MessagingProvider {
  readonly type = 'gupshup' as const

  async sendMessage(config: ClinicMessagingConfig, input: SendMessageInput): Promise<SendMessageResult> {
    const apiKey = config.apiKey
    const source = normalizePhone(config.phoneNumber || config.phoneNumberId || '')
    if (!apiKey || !source) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: 'Missing Gupshup API key or source number',
      }
    }

    try {
      const params = new URLSearchParams()
      params.append('channel', 'whatsapp')
      params.append('source', source)
      params.append('destination', normalizePhone(input.to))
      params.append('src.name', config.appId || 'PatientFlowAI')
      params.append('apikey', apiKey)
      params.append(
        'message',
        JSON.stringify({
          type: 'text',
          text: input.content,
          previewUrl: false,
        })
      )

      const response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return {
          success: false,
          provider: this.type,
          status: 'failed',
          error: String((data as Record<string, unknown>).message || response.statusText),
          raw: data,
        }
      }

      const messageId = String((data as Record<string, unknown>).messageId || `gs_${Date.now()}`)
      return { success: true, provider: this.type, status: 'sent', messageId, raw: data }
    } catch (error) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Gupshup send failed',
      }
    }
  }

  async receiveWebhook(payload: unknown): Promise<ReceiveWebhookResult> {
    const root = asRecord(payload)
    const messages: IncomingProviderMessage[] = []
    const statuses: IncomingProviderStatus[] = []

    if (root.type === 'message') {
      const p = asRecord(root.payload)
      const sender = asRecord(p.sender)
      const body = asRecord(p.body)
      messages.push({
        from: String(sender.phone || ''),
        to: String(p.destination || ''),
        content: String(body.text || ''),
        messageId: String(p.id || `gs_in_${Date.now()}`),
        timestamp: new Date(Number(root.timestamp || Date.now())).toISOString(),
        provider: this.type,
        raw: payload,
      })
    }

    if (root.type === 'message-event') {
      const event = asRecord(root.payload)
      const status = String(event.status || 'sent').toLowerCase()
      if (event.id) {
        statuses.push({
          messageId: String(event.id),
          status: status === 'failed' ? 'failed' : status === 'read' ? 'read' : status === 'delivered' ? 'delivered' : 'sent',
          provider: this.type,
          raw: payload,
        })
      }
    }

    return { messages, statuses }
  }

  async initiateVerification(config: ClinicMessagingConfig, phoneNumber: string): Promise<VerifyNumberResult> {
    if (!config.apiKey || !config.appId) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: 'Missing Gupshup app credentials',
      }
    }

    const endpoint = `https://partner.gupshup.io/partner/app/${config.appId}/register`
    const params = new URLSearchParams()
    params.append('phone', phoneNumber)
    params.append('verify_method', 'otp')
    params.append('apikey', config.apiKey)

    try {
      const response = await fetch(endpoint, { method: 'POST', body: params })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          success: false,
          provider: this.type,
          status: 'failed',
          error: String((data as Record<string, unknown>).message || response.statusText),
        }
      }

      return { success: true, provider: this.type, status: 'connecting', message: 'OTP sent successfully' }
    } catch (error) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to initiate verification',
      }
    }
  }

  async verifyOtp(config: ClinicMessagingConfig, phoneNumber: string, otp: string): Promise<VerifyNumberResult> {
    if (!config.apiKey || !config.appId) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: 'Missing Gupshup app credentials',
      }
    }

    const endpoint = `https://partner.gupshup.io/partner/app/${config.appId}/verify`
    const params = new URLSearchParams()
    params.append('phone', phoneNumber)
    params.append('otp', otp)
    params.append('apikey', config.apiKey)

    try {
      const response = await fetch(endpoint, { method: 'POST', body: params })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          success: false,
          provider: this.type,
          status: 'failed',
          error: String((data as Record<string, unknown>).message || response.statusText),
        }
      }

      return { success: true, provider: this.type, status: 'connected', message: 'Number verified' }
    } catch (error) {
      return {
        success: false,
        provider: this.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'OTP verification failed',
      }
    }
  }
}
