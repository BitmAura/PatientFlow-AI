import crypto from 'crypto'

const CONSENT_SECRET = process.env.CONSENT_SECRET || 'fallback-secret-for-dev'

export function generateConsentToken(patientId: string, phone: string) {
  const payload = `${patientId}:${phone}`
  const signature = crypto
    .createHmac('sha256', CONSENT_SECRET)
    .update(payload)
    .digest('hex')
  
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

export function verifyConsentToken(token: string): { patientId: string; phone: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [patientId, phone, signature] = decoded.split(':')
    
    const payload = `${patientId}:${phone}`
    const expectedSignature = crypto
      .createHmac('sha256', CONSENT_SECRET)
      .update(payload)
      .digest('hex')
    
    if (signature !== expectedSignature) return null
    
    return { patientId, phone }
  } catch {
    return null
  }
}
