export const gupshupConfig = {
  // App ID provided by Gupshup for the partner app
  appId: process.env.GUPSHUP_APP_ID || '',
  
  // App Token (API Key) for authentication
  appToken: process.env.GUPSHUP_APP_TOKEN || '',
  
  // Legacy API Key (sometimes different from appToken)
  apiKey: process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN || '',
  
  // Base URL for Gupshup API (defaulting to the standard one)
  baseUrl: process.env.GUPSHUP_BASE_URL || 'https://api.gupshup.io/wa/api/v1',
  
  // Partner base URL for registration/verification
  partnerBaseUrl: 'https://partner.gupshup.io/partner/app',
  
  // Webhook Secret for verifying incoming callbacks
  webhookSecret: process.env.GUPSHUP_WEBHOOK_SECRET || '',

  // System-wide fallback source number (e.g. Agency Master Number)
  sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || '',
};

// Validation function to ensure critical config is present
export function validateGupshupConfig() {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!gupshupConfig.appId) errors.push('GUPSHUP_APP_ID is required')
  if (!gupshupConfig.appToken && !gupshupConfig.apiKey) {
    errors.push('GUPSHUP_APP_TOKEN or GUPSHUP_API_KEY is required')
  }
  
  if (!gupshupConfig.webhookSecret) {
    warnings.push('GUPSHUP_WEBHOOK_SECRET not set - webhook verification disabled')
  }
  
  if (!gupshupConfig.sourceNumber) {
    warnings.push('GUPSHUP_SOURCE_NUMBER not set - must be provided per-clinic')
  }
  
  if (errors.length > 0) {
    console.error('[Gupshup Config] ❌ Missing critical config:', errors.join(', '))
    return false
  }
  
  if (warnings.length > 0) {
    console.warn('[Gupshup Config] ⚠️  Warnings:', warnings.join(', '))
  }
  
  console.log('[Gupshup Config] ✅ Configuration valid')
  return true
}

// Get per-clinic config (can override system config)
export function getClinicGupshupConfig(clinicOverrides?: {
  appId?: string
  appToken?: string
  apiKey?: string
  sourceNumber?: string
}) {
  return {
    appId: clinicOverrides?.appId || gupshupConfig.appId,
    appToken: clinicOverrides?.appToken || gupshupConfig.appToken,
    apiKey: clinicOverrides?.apiKey || gupshupConfig.apiKey,
    baseUrl: gupshupConfig.baseUrl,
    partnerBaseUrl: gupshupConfig.partnerBaseUrl,
    webhookSecret: gupshupConfig.webhookSecret,
    sourceNumber: clinicOverrides?.sourceNumber || gupshupConfig.sourceNumber,
  }
}

// Check if Gupshup is properly configured for a specific clinic
export function isGupshupConfigured(clinicConfig?: {
  appId?: string
  apiKey?: string
  sourceNumber?: string
}): boolean {
  const config = getClinicGupshupConfig(clinicConfig)
  return !!(config.appId && config.apiKey && config.sourceNumber)
}
