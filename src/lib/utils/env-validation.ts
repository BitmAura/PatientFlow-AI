/**
 * Production environment variable validation.
 * Called once at server startup via instrumentation.ts.
 * Fails hard for required keys, warns for optional-but-important ones.
 */

interface EnvCheck {
  key: string
  required: boolean
  description: string
}

const ENV_CHECKS: EnvCheck[] = [
  // ── Required: nothing works without these ────────────────────────────────
  { key: 'NEXT_PUBLIC_SUPABASE_URL',    required: true,  description: 'Supabase project URL' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anon key' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY',   required: true,  description: 'Supabase service role key (server-only)' },
  { key: 'NEXT_PUBLIC_APP_URL',         required: true,  description: 'Public app URL (used in booking links)' },
  { key: 'CRON_SECRET',                 required: true,  description: 'Secret for Vercel cron job authorization' },
  { key: 'JWT_SECRET',                  required: true,  description: 'JWT secret for patient portal sessions' },
  { key: 'OTP_SECRET',                  required: true,  description: 'HMAC secret for OTP hashing' },

  // ── Required for payments ─────────────────────────────────────────────────
  { key: 'RAZORPAY_KEY_ID',                required: true,  description: 'Razorpay key ID (server-side)' },
  { key: 'RAZORPAY_KEY_SECRET',            required: true,  description: 'Razorpay key secret' },
  { key: 'RAZORPAY_WEBHOOK_SECRET',        required: true,  description: 'Razorpay webhook signature secret' },
  { key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID',    required: true,  description: 'Razorpay key ID (client-side checkout)' },
  { key: 'RAZORPAY_PLAN_STARTER_MONTHLY',  required: true,  description: 'Razorpay plan ID for Starter monthly' },
  { key: 'RAZORPAY_PLAN_GROWTH_MONTHLY',   required: true,  description: 'Razorpay plan ID for Growth monthly' },
  { key: 'RAZORPAY_PLAN_PRO_MONTHLY',      required: true,  description: 'Razorpay plan ID for Pro monthly' },

  // ── Required for WhatsApp (Gupshup) ──────────────────────────────────────
  { key: 'GUPSHUP_APP_ID',             required: true,  description: 'Gupshup app ID for WhatsApp' },
  { key: 'GUPSHUP_APP_TOKEN',          required: true,  description: 'Gupshup app token' },
  { key: 'GUPSHUP_WEBHOOK_SECRET',     required: true,  description: 'Gupshup webhook signature secret' },

  // ── Required for email ────────────────────────────────────────────────────
  { key: 'RESEND_API_KEY',             required: true,  description: 'Resend API key for email delivery' },

  // ── Important but optional (warns, doesn't block) ────────────────────────
  { key: 'MSG91_API_KEY',              required: false, description: 'MSG91 API key for SMS fallback' },
  { key: 'MSG91_SENDER_ID',            required: false, description: 'MSG91 sender ID for SMS' },
  { key: 'NEXT_PUBLIC_POSTHOG_KEY',    required: false, description: 'PostHog key for analytics' },
]

export function validateEnv(): void {
  // Only enforce in production
  if (process.env.NODE_ENV !== 'production') return

  const missing: string[] = []
  const warnings: string[] = []

  for (const check of ENV_CHECKS) {
    const value = process.env[check.key]
    const isEmpty = !value || value.trim() === '' ||
      value.startsWith('your-') ||
      value.startsWith('rzp_test_YOUR') ||
      value === 'replace-with-long-random-secret'

    if (isEmpty) {
      if (check.required) {
        missing.push(`  ✗ ${check.key} — ${check.description}`)
      } else {
        warnings.push(`  ⚠ ${check.key} — ${check.description}`)
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(
      '[PatientFlow] Optional environment variables not set (some features may be degraded):\n' +
      warnings.join('\n')
    )
  }

  if (missing.length > 0) {
    const message =
      '\n\n' +
      '╔══════════════════════════════════════════════════════════════╗\n' +
      '║  PATIENTFLOW AI — MISSING REQUIRED ENVIRONMENT VARIABLES    ║\n' +
      '╚══════════════════════════════════════════════════════════════╝\n\n' +
      'The following variables must be set before the app can start:\n\n' +
      missing.join('\n') +
      '\n\nSet these in your Vercel project settings → Environment Variables.\n' +
      'See .env.example for the full list and descriptions.\n'

    // Throw to crash the process — better to fail loud than run broken
    throw new Error(message)
  }
}
