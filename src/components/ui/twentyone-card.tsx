'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface TwentyOneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Softer surface for nested sections */
  variant?: 'default' | 'muted' | 'inset'
}

/**
 * Glass + gradient-border panel in the spirit of 21st.dev marketing blocks —
 * use for dashboard sections and KPI surfaces.
 */
export const TwentyOneCard = React.forwardRef<HTMLDivElement, TwentyOneCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const surface =
      variant === 'muted'
        ? 'bg-slate-50/90 dark:bg-slate-900/60'
        : variant === 'inset'
          ? 'bg-white/60 dark:bg-slate-950/50'
          : 'bg-white/85 dark:bg-slate-900/75'

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-emerald-500/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          'backdrop-blur-[2px]',
          surface,
          className
        )}
        {...props}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.07)_0%,transparent_45%,rgba(15,23,42,0.04)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.12)_0%,transparent_50%,rgba(15,23,42,0.35)_100%)]"
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    )
  }
)

TwentyOneCard.displayName = 'TwentyOneCard'
