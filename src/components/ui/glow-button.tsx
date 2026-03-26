'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Button, ButtonProps } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface GlowButtonProps extends ButtonProps {
  glowColor?: string
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      className,
      variant = 'default',
      glowColor = 'rgba(14, 165, 233, 0.5)',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="group relative inline-block">
        <div
          className={cn(
            'absolute -inset-0.5 rounded-lg opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200',
            variant === 'outline' ? 'opacity-0' : '',
            'bg-[var(--glow-color)]'
          )}
          style={
            {
              '--glow-color': variant === 'default' ? glowColor : 'transparent',
            } as React.CSSProperties
          }
        />
        <Button
          ref={ref}
          variant={variant}
          className={cn('relative font-semibold tracking-wide', className)}
          {...props}
        >
          {children}
        </Button>
      </div>
    )
  }
)
GlowButton.displayName = 'GlowButton'
