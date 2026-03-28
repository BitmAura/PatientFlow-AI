import * as Sentry from '@sentry/nextjs'

/**
 * Central error/event logger. When you add @sentry/nextjs, call Sentry.captureException
 * inside logError so all errors are reported in one place.
 */

export function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const payload = {
    message,
    error: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
    ...context,
  }
  console.error('[Error]', payload)

  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error ?? new Error(message), {
      tags: { logger: 'central' },
      extra: context,
    })
  }
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  const payload = {
    message,
    timestamp: new Date().toISOString(),
    ...context,
  }
  console.warn('[Warn]', payload)

  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: 'warning',
      tags: { logger: 'central' },
      extra: context,
    })
  }
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Info]', {
      message,
      timestamp: new Date().toISOString(),
      ...(context ?? {}),
    })
  }
}
