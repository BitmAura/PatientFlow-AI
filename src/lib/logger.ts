/**
 * Central error/event logger. When you add @sentry/nextjs, call Sentry.captureException
 * inside logError so all errors are reported in one place.
 */

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const payload = { message, error: error instanceof Error ? error.message : String(error), ...context }
  console.error('[Error]', payload)
  // When SENTRY_DSN is set, you can add: Sentry.captureException(error ?? new Error(message), { extra: context })
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  console.warn('[Warn]', message, context ?? '')
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Info]', message, context ?? '')
  }
}
