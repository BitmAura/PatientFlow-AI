'use client'

import { useEffect } from 'react'
import { initPostHog } from '@/lib/posthog-client'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog()
  }, [])

  return <>{children}</>
}
