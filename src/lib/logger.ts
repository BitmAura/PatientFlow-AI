import { PostHog } from 'posthog-node'

const posthog = process.env.POSTHOG_API_KEY
  ? new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    })
  : undefined

const buildProperties = (message: string, error?: unknown, context?: Record<string, unknown>) => ({
  message,
  error: error instanceof Error ? error.message : String(error ?? 'unknown'),
  timestamp: new Date().toISOString(),
  ...context,
})

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const payload = buildProperties(message, error, context)
  console.error('[Error]', payload)

  if (posthog) {
    posthog.capture({
      distinctId: 'server',
      event: 'server_error',
      properties: payload,
    })
  }
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  const payload = buildProperties(message, undefined, context)
  console.warn('[Warn]', payload)

  if (posthog) {
    posthog.capture({
      distinctId: 'server',
      event: 'server_warning',
      properties: payload,
    })
  }
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  const payload = {
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Info]', payload)
  }

  if (posthog) {
    posthog.capture({
      distinctId: 'server',
      event: 'server_info',
      properties: payload,
    })
  }
}
