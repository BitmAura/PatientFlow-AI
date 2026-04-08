'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

export function initPostHog() {
  if (typeof window === 'undefined' || !POSTHOG_KEY) {
    return
  }

  if ((window as any).posthog?.__loaded) {
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    persistence: 'localStorage',
    disable_session_recording: true,
  })
}

export function capturePostHogEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return
  }

  posthog.capture(event, properties)
}

export function capturePostHogException(error: Error, properties?: Record<string, unknown>) {
  capturePostHogEvent('exception', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...properties,
  })
}
