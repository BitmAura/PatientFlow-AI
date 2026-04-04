export const gupshupConfig = {
  // App ID provided by Gupshup for the partner app
  appId: process.env.GUPSHUP_APP_ID || '',
  
  // App Token (API Key) for authentication
  appToken: process.env.GUPSHUP_APP_TOKEN || '',
  
  // Base URL for Gupshup API (defaulting to the standard one)
  baseUrl: process.env.GUPSHUP_BASE_URL || 'https://api.gupshup.io/wa/api/v1',
  
  // Webhook Secret for verifying incoming callbacks
  webhookSecret: process.env.GUPSHUP_WEBHOOK_SECRET || '',

  // System-wide fallback source number (e.g. Agency Master Number)
  sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || '',
};

// Validation function to ensure critical config is present
export function validateGupshupConfig() {
  const missing = [];
  if (!gupshupConfig.appId) missing.push('GUPSHUP_APP_ID');
  if (!gupshupConfig.appToken) missing.push('GUPSHUP_APP_TOKEN');
  
  if (missing.length > 0) {
    console.warn(`[Gupshup Config] Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}
