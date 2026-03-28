'use client'

import { useCallback } from 'react'
import { trackCtaEvent } from '@/lib/analytics/cta'

export function useTrackCta() {
  return useCallback(
    (ctaLabel: string, ctaLocation: string, destination?: string) => {
      trackCtaEvent({ ctaLabel, ctaLocation, destination })
    },
    []
  )
}
