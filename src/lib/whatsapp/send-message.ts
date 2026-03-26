import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from './rate-limiter'
import { logError } from '@/lib/logger'
import { WhatsAppTemplate } from './types'
import { gupshupConfig } from '@/config/gupshup'
import { WhatsAppProviderFactory } from './provider-factory'

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
  status: 'sent' | 'failed' | 'skipped'
}

/** Returns true if clinic has an active or trialing subscription (owner user). */
async function clinicCanSend(clinicId: string): Promise<boolean> {
  const admin = createAdminClient() as any
  const { data: owner } = await admin
    .from('staff')
    .select('user_id')
    .eq('clinic_id', clinicId)
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle()
  if (!owner?.user_id) return false
  const { data: sub } = await admin
    .from('subscriptions')
    .select('trial_end')
    .eq('user_id', owner.user_id)
    .in('status', ['trialing', 'active'])
    .limit(1)
    .maybeSingle()
  if (!sub) return false
  if (sub.trial_end && new Date(sub.trial_end) <= new Date()) return false
  return true
}

/**
 * Send WhatsApp message via Gupshup (doctor's number → leads/patients) or Meta Cloud API.
 * Uses clinic's whatsapp_connections: when provider is Gupshup, messages go FROM the
 * doctor's registered number (source) TO the recipient (lead/patient).
 */
export async function sendWhatsAppMessage(
  clinicId: string,
  phone: string,
  content: string | WhatsAppTemplate,
  metadata?: any
): Promise<SendMessageResult> {
  const supabase = createClient() as any

  const canSend = await checkRateLimit(clinicId)
  if (!canSend) {
    return { success: false, error: 'Rate limit exceeded', status: 'skipped' }
  }

  const canSendByPlan = await clinicCanSend(clinicId)
  if (!canSendByPlan) {
    return { success: false, error: 'No active subscription or trial', status: 'skipped' }
  }

  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10) {
    return { success: false, error: 'Invalid phone number', status: 'failed' }
  }

  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('session_data, status')
    .eq('clinic_id', clinicId)
    .single()

  const sessionData = (connection?.session_data || {}) as Record<string, any>
  const allowedStatuses = ['connected', 'active']
  if (!connection?.status || !allowedStatuses.includes(connection.status)) {
    logError('WhatsApp blocked: not connected or active', null, { clinicId, status: connection?.status })
    return { success: false, error: 'WhatsApp is not connected or active', status: 'failed' }
  }

  const useGupshup =
    sessionData.provider === 'gupshup' ||
    (sessionData.appId && (sessionData.apiKey || gupshupConfig.appToken))

  if (useGupshup) {
    return sendViaGupshup(supabase, clinicId, cleanPhone, content, metadata, sessionData)
  }

  return sendViaMeta(supabase, clinicId, cleanPhone, content, metadata, sessionData)
}

/** Send via Gupshup: FROM doctor's number (source) TO recipient. */
async function sendViaGupshup(
  supabase: any,
  clinicId: string,
  cleanPhone: string,
  content: string | WhatsAppTemplate,
  metadata: any,
  sessionData: Record<string, any>
): Promise<SendMessageResult> {
  const apiKey = sessionData.apiKey || gupshupConfig.appToken
  const appId = sessionData.appId || gupshupConfig.appId
  const sourceNumber =
    sessionData.phoneNumberId ||
    sessionData.verified_number ||
    sessionData.phone_number

  if (!apiKey || !sourceNumber) {
    return {
      success: false,
      error: 'Gupshup credentials or doctor number not configured',
      status: 'failed',
    }
  }

  const sourceDigits = sourceNumber.replace(/\D/g, '')
  const config = {
    apiKey,
    appId,
    phoneNumberId: sourceDigits,
    appName: sessionData.appName || 'AuraRecall',
  }

  const provider = WhatsAppProviderFactory.getProvider('gupshup')
  const isText = typeof content === 'string'
  const result = await provider.sendMessage(
    cleanPhone,
    isText
      ? { type: 'text', content }
      : { type: 'template', content },
    config
  )

  const logContent = isText ? content : `Template: ${(content as WhatsAppTemplate).name}`
  await supabase.from('reminder_logs').insert({
    clinic_id: clinicId,
    patient_id: metadata?.patientId ?? null,
    appointment_id: metadata?.appointmentId ?? null,
    phone: cleanPhone,
    message: logContent,
    type: metadata?.type || 'manual',
    status: result.success ? 'sent' : 'failed',
    message_id: result.messageId,
    error: result.error ?? null,
    created_at: new Date().toISOString(),
  } as any)

  if (!result.success) {
    return { success: false, error: result.error, status: 'failed' }
  }
  return { success: true, messageId: result.messageId, status: 'sent' }
}

/** Send via Meta Cloud API (fallback when not using Gupshup). */
async function sendViaMeta(
  supabase: any,
  clinicId: string,
  cleanPhone: string,
  content: string | WhatsAppTemplate,
  metadata: any,
  sessionData: Record<string, any>
): Promise<SendMessageResult> {
  const accessToken = sessionData.access_token || process.env.WHATSAPP_API_KEY
  const phoneNumberId = sessionData.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID
  const apiBase = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0'

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'Meta WhatsApp credentials not configured', status: 'failed' }
  }

  let payload: any = { messaging_product: 'whatsapp', to: cleanPhone }
  if (typeof content === 'string') {
    payload.type = 'text'
    payload.text = { body: content }
  } else {
    payload.type = 'template'
    payload.template = content
  }

  try {
    const response = await fetch(`${apiBase}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    const responseBody = await response.json()
    if (!response.ok) {
      throw new Error(responseBody?.error?.message || 'WhatsApp send failed')
    }
    const messageId =
      responseBody?.messages?.[0]?.id ||
      `wamid.${Date.now()}.${Math.random().toString(36).substring(7)}`
    const logContent = typeof content === 'string' ? content : `Template: ${(content as WhatsAppTemplate).name}`
    await supabase.from('reminder_logs').insert({
      clinic_id: clinicId,
      patient_id: metadata?.patientId ?? null,
      appointment_id: metadata?.appointmentId ?? null,
      phone: cleanPhone,
      message: logContent,
      type: metadata?.type || 'manual',
      status: 'sent',
      message_id: messageId,
      created_at: new Date().toISOString(),
    } as any)
    return { success: true, messageId, status: 'sent' }
  } catch (error: any) {
    const logContent = typeof content === 'string' ? content : `Template: ${(content as WhatsAppTemplate).name}`
    await supabase.from('reminder_logs').insert({
      clinic_id: clinicId,
      patient_id: metadata?.patientId ?? null,
      appointment_id: metadata?.appointmentId ?? null,
      phone: cleanPhone,
      message: logContent,
      type: metadata?.type || 'manual',
      status: 'failed',
      error: error?.message || 'Unknown error',
      created_at: new Date().toISOString(),
    } as any)
    return { success: false, error: error?.message, status: 'failed' }
  }
}
