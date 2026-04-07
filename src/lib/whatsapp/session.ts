import { z } from 'zod'

export const WhatsAppSessionSchema = z.object({
  apiKey: z.string().min(1).optional(),
  appId: z.string().optional(),
  phoneNumberId: z.string().optional(),
  phone_number_id: z.string().optional(),
  access_token: z.string().optional(),
  verify_token: z.string().optional(),
  webhook_secret: z.string().optional(),
  phone_number: z.string().optional(),
  verified_number: z.string().optional(),
  appName: z.string().optional(),
  provider: z.string().optional(),
  // also accept camelCase variants commonly seen in stored session_data
  verifyToken: z.string().optional(),
  webhookSecret: z.string().optional(),
})

export type WhatsAppSession = z.infer<typeof WhatsAppSessionSchema>

export function parseWhatsAppSession(raw: unknown): WhatsAppSession | null {
  try {
    return WhatsAppSessionSchema.parse(raw)
  } catch (err) {
    return null
  }
}

export function getApiKeyFromSession(session: WhatsAppSession | null) {
  if (!session) return ''
  return String(session.apiKey || session.access_token || '')
}

export function getPhoneNumberIdFromSession(session: WhatsAppSession | null) {
  if (!session) return ''
  return String(session.phoneNumberId || session.phone_number_id || '')
}
