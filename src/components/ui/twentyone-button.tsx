'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils/cn'

type TwentyOneButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary'
  /**
   * Render as child (e.g. Next.js `Link`). Radix Slot requires exactly one element child —
   * do not add extra wrapper nodes inside this component when asChild is true.
   */
  asChild?: boolean
}

export const TwentyOneButton = React.forwardRef<HTMLButtonElement, TwentyOneButtonProps>(
  ({ className, tone = 'primary', children, asChild = false, type, ...props }, ref) => {
    const toneClasses =
      tone === 'primary'
        ? 'bg-[linear-gradient(135deg,#0f172a,#0b3b2e_55%,#16a34a)] text-white border-slate-900/70 hover:shadow-emerald-500/30'
        : 'bg-white text-slate-900 border-slate-300 hover:border-emerald-500 hover:text-emerald-700'

    const sharedLayout =
      'group relative inline-flex h-12 min-h-[48px] items-center justify-center overflow-hidden rounded-xl border px-6 text-sm font-semibold tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%)] before:opacity-80 before:-z-0 [&>*]:relative [&>*]:z-10'

    if (asChild) {
      return (
        <Slot ref={ref} className={cn(sharedLayout, toneClasses, className)} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(
          'group relative inline-flex h-12 min-h-[48px] items-center justify-center overflow-hidden rounded-xl border px-6 text-sm font-semibold tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]',
          toneClasses,
          className
        )}
        {...props}
      >
        <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%)] opacity-80" />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    )
  }
)

TwentyOneButton.displayName = 'TwentyOneButton'
