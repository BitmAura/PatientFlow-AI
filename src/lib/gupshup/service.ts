/**
 * Gupshup Service - Centralized WhatsApp messaging via Gupshup
 * 
 * Handles:
 * - Message sending with retry logic
 * - Number registration and verification
 * - Webhook verification
 * - Error logging and monitoring
 */

import { getClinicGupshupConfig } from '@/config/gupshup'
import { logError } from '@/lib/logger'

export interface GupshupMessageParams {
  clinicId: string
  phoneNumberId: string
  apiKey: string
  destination: string
  messageText: string
  appName?: string
}

export interface GupshupRegistrationParams {
  clinicId: string
  phoneNumber: string
  appId: string
  apiKey: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
  retryAttempt?: number
}

/**
 * Send WhatsApp message via Gupshup API
 * Includes automatic retry with exponential backoff
 */
export async function sendGupshupMessage(
  params: GupshupMessageParams,
  retryAttempt = 0
): Promise<SendResult> {
  const { clinicId, phoneNumberId, apiKey, destination, messageText, appName = 'AuraRecall' } = params
  const maxRetries = 3
  let statusCode: number | undefined

  try {
    const formData = new URLSearchParams()
    formData.append('channel', 'whatsapp')
    formData.append('source', phoneNumberId.replace(/\D/g, ''))
    formData.append('destination', destination.replace(/\D/g, ''))
    formData.append('src.name', appName)
    formData.append('message', JSON.stringify({
      type: 'text',
      text: messageText,
      previewUrl: false,
    }))
    formData.append('apikey', apiKey)

    const response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    statusCode = response.status
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = (data as any)?.message || (data as any)?.status || response.statusText
      throw new Error(`Gupshup API error: ${error}`)
    }

    const messageId = (data as any)?.messageId || (data as any)?.message?.['id'] || `gs_${Date.now()}`

    console.log(`[Gupshup] ✅ Message sent (Attempt ${retryAttempt + 1})`, {
      clinicId,
      destination,
      messageId,
    })

    return {
      success: true,
      messageId,
      retryAttempt,
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error'
    
    // Determine if retryable
    const isRetryable = 
      error.message?.includes('timeout') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('429') || // Rate limit
      error.message?.includes('503') // Service unavailable

    if (isRetryable && retryAttempt < maxRetries) {
      const delay = Math.pow(2, retryAttempt + 1) * 1000 // 2s, 4s, 8s
      console.warn(`[Gupshup] ⚠️  Retryable error, waiting ${delay}ms before retry:`, errorMessage)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return sendGupshupMessage(params, retryAttempt + 1)
    }

    console.error(`[Gupshup] ❌ Failed to send message after ${retryAttempt + 1} attempt(s):`, errorMessage)
    
    await logError(
      `Gupshup message send failed after retries`,
      error,
      {
        clinicId,
        destination,
        attempt: retryAttempt + 1,
        isRetryable,
      }
    )

    return {
      success: false,
      error: errorMessage,
      statusCode,
      retryAttempt,
    }
  }
}

/**
 * Register phone number with Gupshup
 * Initiates OTP verification flow
 */
export async function registerPhoneWithGupshup(
  params: GupshupRegistrationParams
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  const { clinicId, phoneNumber, appId, apiKey } = params
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  try {
    const formData = new URLSearchParams()
    formData.append('phone', cleanPhone)
    formData.append('verify_method', 'otp')
    formData.append('apikey', apiKey)

    const response = await fetch(
      `https://partner.gupshup.io/partner/app/${appId}/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = (data as any)?.message || response.statusText
      throw new Error(error || 'Registration failed')
    }

    const requestId = (data as any)?.request_id || (data as any)?.id

    console.log(`[Gupshup] ✅ Phone registration initiated`, {
      clinicId,
      phone: cleanPhone,
      requestId,
    })

    return {
      success: true,
      requestId,
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown registration error'
    
    console.error(`[Gupshup] ❌ Registration failed:`, errorMessage)
    
    await logError(
      `Gupshup registration failed`,
      error,
      { clinicId, phone: cleanPhone }
    )

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Verify OTP for registered phone number
 */
export async function verifyPhoneOtpGupshup(params: {
  clinicId: string
  phoneNumber: string
  otp: string
  appId: string
  apiKey: string
}): Promise<{ success: boolean; error?: string; numberId?: string }> {
  const { clinicId, phoneNumber, otp, appId, apiKey } = params
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  try {
    const formData = new URLSearchParams()
    formData.append('phone', cleanPhone)
    formData.append('otp', otp)
    formData.append('apikey', apiKey)

    const response = await fetch(
      `https://partner.gupshup.io/partner/app/${appId}/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = (data as any)?.message || response.statusText
      throw new Error(error || 'OTP verification failed')
    }

    const numberId = (data as any)?.number_id || (data as any)?.id || `ph_${cleanPhone}`

    console.log(`[Gupshup] ✅ Phone verified`, {
      clinicId,
      phone: cleanPhone,
      numberId,
    })

    return {
      success: true,
      numberId,
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown OTP error'
    
    console.error(`[Gupshup] ❌ OTP verification failed:`, errorMessage)
    
    await logError(
      `Gupshup OTP verification failed`,
      error,
      { clinicId, phone: cleanPhone }
    )

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Verify Gupshup webhook signature
 * Ensures incoming webhooks are authentic
 */
export function verifyGupshupWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('[Gupshup] ⚠️  Webhook verification disabled - missing signature or secret')
    return true // Allow webhooks if secret not configured
  }

  try {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const valid = hash === signature
    if (!valid) {
      console.warn('[Gupshup] ❌ Invalid webhook signature')
    }
    return valid
  } catch (error) {
    console.error('[Gupshup] ❌ Webhook verification error:', error)
    return false
  }
}

/**
 * Parse Gupshup webhook payload
 * Handles both message and status webhooks
 */
export function parseGupshupWebhook(payload: any): {
  type: 'message' | 'status' | 'unknown'
  data: any
} {
  if (payload.type === 'message') {
    return {
      type: 'message',
      data: {
        from: payload.payload?.sender?.phone,
        text: payload.payload?.body?.text || payload.payload?.body,
        messageId: payload.payload?.id,
        timestamp: payload.timestamp,
      },
    }
  }

  if (payload.type === 'message_status') {
    return {
      type: 'status',
      data: {
        messageId: payload.payload?.id,
        status: payload.payload?.status, // delivered, read, failed
        timestamp: payload.timestamp,
      },
    }
  }

  return {
    type: 'unknown',
    data: payload,
  }
}

/**
 * Get Gupshup status and health check
 */
export async function getGupshupStatus(apiKey: string): Promise<{
  healthy: boolean
  message: string
  timestamp: string
}> {
  try {
    // Simple health check - try to get account info
    const response = await fetch('https://api.gupshup.io/wa/api/v1/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
      }).toString(),
    })

    if (response.ok) {
      return {
        healthy: true,
        message: 'Gupshup API is healthy',
        timestamp: new Date().toISOString(),
      }
    }

    return {
      healthy: false,
      message: `Gupshup API returned ${response.status}`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      healthy: false,
      message: `Gupshup health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    }
  }
}