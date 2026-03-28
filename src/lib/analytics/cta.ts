'use client'

import { track } from '@vercel/analytics'

export type CtaEventPayload = {
  ctaLabel: string
  ctaLocation: string
  destination?: string
  pagePath?: string
}

export function trackCtaEvent(payload: CtaEventPayload): void {
  const eventPayload = {
    cta_label: payload.ctaLabel,
    cta_location: payload.ctaLocation,
    destination: payload.destination ?? '',
    page_path: payload.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    timestamp: new Date().toISOString(),
  }

  track('cta_click', eventPayload)

  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    ;(window as any).gtag('event', 'cta_click', eventPayload)
  }
}
