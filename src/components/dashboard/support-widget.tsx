'use client'

import { useEffect } from 'react'

/**
 * Support Widget Component
 * 🧬 Persona: Customer Success
 * ⚡ Purpose: Injects the Crisp support widget for real-time clinic assistance.
 */
export function SupportWidget() {
  useEffect(() => {
    // Check if we have a website ID. If not, don't inject.
    const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!CRISP_WEBSITE_ID) return

    // Standard Crisp Injection Script
    ;(window as any).$crisp = [];
    ;(window as any).CRISP_WEBSITE_ID = CRISP_WEBSITE_ID
    ;(function () {
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      d.getElementsByTagName('head')[0].appendChild(s)
    })()
  }, [])

  return null
}
