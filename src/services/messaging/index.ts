import { createAdminClient } from '@/lib/supabase/admin'
import { GupshupMessagingProvider } from '@/services/messaging/providers/gupshup'
import { MetaMessagingProvider } from '@/services/messaging/providers/meta'
import {
  ClinicMessagingConfig,
  IncomingProviderMessage,
  MessagingProvider,
  MessagingProviderType,
  ReceiveWebhookResult,
  SendMessageInput,
  SendMessageResult,
  VerifyNumberInput,
  VerifyNumberResult,
} from '@/services/messaging/types'

const providers: Record<MessagingProviderType, MessagingProvider> = {
  gupshup: new GupshupMessagingProvider(),
  meta: new MetaMessagingProvider(),
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function getProvider(provider: MessagingProviderType): MessagingProvider {
  return providers[provider]
}

async function getClinicConfig(clinicId: string): Promise<ClinicMessagingConfig> {
  const admin = createAdminClient() as any
  const { data: providerConfig } = await admin
    .from('whatsapp_configs')
    .select('provider, phone_number, credentials, is_active')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  const cfgCredentials = asRecord(providerConfig?.credentials)
  if (providerConfig?.provider) {
    const provider = (providerConfig.provider === 'meta' ? 'meta' : 'gupshup') as MessagingProviderType
    return {
      clinicId,
      provider,
      phoneNumber: String(providerConfig.phone_number || ''),
      appId: String(cfgCredentials.appId || process.env.GUPSHUP_APP_ID || ''),
      apiKey: String(cfgCredentials.apiKey || process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN || ''),
      phoneNumberId: String(cfgCredentials.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || ''),
      accessToken: String(cfgCredentials.accessToken || process.env.WHATSAPP_API_KEY || ''),
      verifyToken: String(cfgCredentials.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''),
      webhookSecret: String(cfgCredentials.webhookSecret || process.env.GUPSHUP_WEBHOOK_SECRET || ''),
      rawSessionData: cfgCredentials,
    }
  }

  const { data: connection } = await admin
    .from('whatsapp_connections')
    .select('session_data')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  const raw = asRecord(connection?.session_data)
  const provider = (raw.provider === 'gupshup' || raw.provider === 'meta' ? raw.provider : 'gupshup') as MessagingProviderType

  return {
    clinicId,
    provider,
    phoneNumber: String(raw.phone_number || raw.verified_number || ''),
    appId: String(raw.appId || process.env.GUPSHUP_APP_ID || ''),
    apiKey: String(raw.apiKey || process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN || ''),
    phoneNumberId: String(raw.phone_number_id || raw.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || ''),
    accessToken: String(raw.access_token || process.env.WHATSAPP_API_KEY || ''),
    verifyToken: String(raw.verify_token || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''),
    webhookSecret: String(raw.webhook_secret || process.env.GUPSHUP_WEBHOOK_SECRET || ''),
    rawSessionData: raw,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function insertMessageLog(input: {
  clinicId: string
  direction: 'inbound' | 'outbound'
  provider: MessagingProviderType
  phoneNumber: string
  message: string
  messageId?: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  error?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const admin = createAdminClient() as any

  const payload = {
    clinic_id: input.clinicId,
    direction: input.direction,
    provider: input.provider,
    phone_number: input.phoneNumber,
    message: input.message,
    message_id: input.messageId || null,
    status: input.status,
    error: input.error || null,
    metadata: input.metadata || {},
    created_at: new Date().toISOString(),
  }

  const { error } = await admin.from('message_logs').insert(payload)
  if (!error) return

  await admin.from('reminder_logs').insert({
    clinic_id: input.clinicId,
    patient_id: null,
    appointment_id: null,
    phone: input.phoneNumber,
    message: input.message,
    type: input.direction === 'outbound' ? 'messaging_service' : 'incoming_message',
    status: input.status,
    message_id: input.messageId || null,
    error: input.error || null,
    metadata: input.metadata || {},
    created_at: new Date().toISOString(),
  } as any)
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const config = await getClinicConfig(input.clinicId)
  const primary = getProvider(config.provider)
  const fallback = getProvider(config.provider === 'gupshup' ? 'meta' : 'gupshup')

  const attempts: Array<{ provider: MessagingProvider; tryCount: number }> = [
    { provider: primary, tryCount: 2 },
    { provider: fallback, tryCount: 1 },
  ]

  for (const attempt of attempts) {
    for (let retry = 0; retry < attempt.tryCount; retry += 1) {
      const result = await attempt.provider.sendMessage({ ...config, provider: attempt.provider.type }, input)
      if (result.success) {
        await insertMessageLog({
          clinicId: input.clinicId,
          direction: 'outbound',
          provider: result.provider,
          phoneNumber: input.to,
          message: input.content,
          messageId: result.messageId,
          status: 'sent',
          metadata: input.metadata,
        })
        return result
      }
      if (retry < attempt.tryCount - 1) await sleep(500)
    }
  }

  const failed: SendMessageResult = {
    success: false,
    provider: config.provider,
    status: 'failed',
    error: 'Message failed on primary and fallback providers',
  }

  await insertMessageLog({
    clinicId: input.clinicId,
    direction: 'outbound',
    provider: config.provider,
    phoneNumber: input.to,
    message: input.content,
    status: 'failed',
    error: failed.error,
    metadata: input.metadata,
  })

  return failed
}

async function updateStatusByMessageId(messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed'): Promise<void> {
  const admin = createAdminClient() as any
  const { error } = await admin.from('message_logs').update({ status }).eq('message_id', messageId)
  if (!error) return
  await admin.from('reminder_logs').update({ status }).eq('message_id', messageId)
}

function detectClinicByIncomingTarget(message: IncomingProviderMessage, fallbackClinicId?: string): Promise<string | null> {
  if (fallbackClinicId) return Promise.resolve(fallbackClinicId)
  const target = (message.to || '').replace(/\D/g, '')
  if (!target) return Promise.resolve(null)

  const admin = createAdminClient() as any
  return admin
    .from('whatsapp_configs')
    .select('clinic_id, phone_number')
    .then((res: any) => {
      const rows = (res.data || []) as Array<{ clinic_id: string; phone_number: string | null }>
      const found = rows.find((row) => String(row.phone_number || '').replace(/\D/g, '') === target)
      if (found?.clinic_id) return found.clinic_id

      return admin
        .from('whatsapp_connections')
        .select('clinic_id, session_data')
        .then((fallbackRes: any) => {
          const fallbackRows = (fallbackRes.data || []) as Array<{ clinic_id: string; session_data: Record<string, unknown> }>
          const fallbackFound = fallbackRows.find((item) => {
            const sd = asRecord(item.session_data)
            const number = String(sd.phone_number || sd.verified_number || sd.phoneNumberId || sd.phone_number_id || '')
            return number.replace(/\D/g, '') === target
          })
          return fallbackFound?.clinic_id || null
        })
    })
}

export async function receiveWebhook(input: {
  provider: MessagingProviderType
  payload: unknown
  clinicId?: string
}): Promise<ReceiveWebhookResult & { resolvedClinicIds: string[] }> {
  const provider = getProvider(input.provider)
  const parsed = await provider.receiveWebhook(input.payload)
  const resolvedClinicIds: string[] = []

  for (const status of parsed.statuses) {
    if (status.messageId) await updateStatusByMessageId(status.messageId, status.status)
  }

  for (const msg of parsed.messages) {
    const clinicId = await detectClinicByIncomingTarget(msg, input.clinicId)
    resolvedClinicIds.push(clinicId || '')
    if (!clinicId) continue
    await insertMessageLog({
      clinicId,
      direction: 'inbound',
      provider: msg.provider,
      phoneNumber: msg.from,
      message: msg.content,
      messageId: msg.messageId,
      status: 'delivered',
      metadata: { timestamp: msg.timestamp },
    })
  }

  return { ...parsed, resolvedClinicIds }
}

export async function verifyNumber(input: VerifyNumberInput): Promise<VerifyNumberResult> {
  const config = await getClinicConfig(input.clinicId)
  const provider = getProvider(input.provider || config.provider)
  const admin = createAdminClient() as any

  const response = input.otp
    ? await provider.verifyOtp(config, input.phoneNumber, input.otp)
    : await provider.initiateVerification(config, input.phoneNumber)

  const nextStatus = response.status === 'connected' ? 'active' : response.status === 'connecting' ? 'connecting' : 'disconnected'

  await admin.from('whatsapp_connections').upsert(
    {
      clinic_id: input.clinicId,
      status: nextStatus,
      session_data: {
        ...(config.rawSessionData || {}),
        provider: provider.type,
        phone_number: input.phoneNumber,
        verified_number: response.status === 'connected' ? input.phoneNumber : config.phoneNumber,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clinic_id' }
  )

  await admin.from('whatsapp_configs').upsert(
    {
      clinic_id: input.clinicId,
      provider: provider.type,
      phone_number: input.phoneNumber,
      credentials: {
        appId: config.appId || process.env.GUPSHUP_APP_ID || null,
        apiKey: config.apiKey || process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN || null,
        phoneNumberId: config.phoneNumberId || null,
        accessToken: config.accessToken || process.env.WHATSAPP_API_KEY || null,
        verifyToken: config.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || null,
        webhookSecret: config.webhookSecret || process.env.GUPSHUP_WEBHOOK_SECRET || null,
      },
      is_active: response.status === 'connected',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clinic_id' }
  )

  return response
}

export function verifyWebhookSignature(params: {
  provider: MessagingProviderType
  request: Request
  expectedSecret?: string
}): boolean {
  if (params.provider === 'meta') {
    return true
  }

  const secret = params.expectedSecret || process.env.GUPSHUP_WEBHOOK_SECRET
  if (!secret) return true
  const authHeader = params.request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7) === secret
  const token = params.request.headers.get('x-gupshup-token') || params.request.headers.get('x-app-token')
  return token === secret
}
