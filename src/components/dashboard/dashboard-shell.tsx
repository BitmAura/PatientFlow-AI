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
        'relative min-h-[calc(100vh-6rem)] rounded-3xl border border-emerald-500/5 bg-gradient-to-br from-white via-emerald-50/40 to-slate-50/90 p-1 shadow-inner dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent)]"
      />
      <div className="relative rounded-[1.25rem] bg-transparent">{children}</div>
    </div>
  )
}
