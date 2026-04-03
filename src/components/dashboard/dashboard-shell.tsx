'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Wraps main dashboard content with a subtle mesh gradient (21st.dev-style depth).
 */
export function DashboardShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh-6rem)] rounded-2xl border border-border/70 bg-card p-1 shadow-sm dark:bg-card',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0))] dark:bg-none"
      />
      <div className="relative rounded-[1.1rem] bg-transparent">{children}</div>
    </div>
  )
}
