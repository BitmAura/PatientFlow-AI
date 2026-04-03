'use client'

import { cn } from '@/lib/utils/cn'
import type { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
        hoverEffect &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
