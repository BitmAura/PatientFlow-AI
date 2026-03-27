export type MessagingProviderType = 'gupshup' | 'meta'

export type MessageDirection = 'inbound' | 'outbound'

export interface ClinicMessagingConfig {
  clinicId: string
  provider: MessagingProviderType
  phoneNumber: string | null
  appId?: string
  apiKey?: string
  phoneNumberId?: string
  accessToken?: string
  verifyToken?: string
  webhookSecret?: string
  rawSessionData?: Record<string, unknown>
}

export interface SendMessageInput {
  clinicId: string
  to: string
  content: string
  type?: 'text' | 'template'
  template?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface SendMessageResult {
  success: boolean
  provider: MessagingProviderType
  messageId?: string
  error?: string
  status: 'sent' | 'failed'
  raw?: unknown
}

export interface IncomingProviderMessage {
  from: string
  to?: string
  content: string
  messageId: string
  timestamp: string
  provider: MessagingProviderType
  raw: unknown
}

export interface IncomingProviderStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  provider: MessagingProviderType
  raw: unknown
}

export interface ReceiveWebhookResult {
  messages: IncomingProviderMessage[]
  statuses: IncomingProviderStatus[]
}

export interface VerifyNumberInput {
  clinicId: string
  phoneNumber: string
  otp?: string
  provider?: MessagingProviderType
}

export interface VerifyNumberResult {
  success: boolean
  provider: MessagingProviderType
  status: 'connecting' | 'connected' | 'failed'
  message?: string
  error?: string
}

export interface MessagingProvider {
  readonly type: MessagingProviderType
  sendMessage(config: ClinicMessagingConfig, input: SendMessageInput): Promise<SendMessageResult>
  receiveWebhook(payload: unknown): Promise<ReceiveWebhookResult>
  initiateVerification(config: ClinicMessagingConfig, phoneNumber: string): Promise<VerifyNumberResult>
  verifyOtp(config: ClinicMessagingConfig, phoneNumber: string, otp: string): Promise<VerifyNumberResult>
}
