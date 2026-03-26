'use client'

import { cn } from '@/lib/utils/cn'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends HTMLMotionProps<'div'> {
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md',
        'dark:border-white/10 dark:bg-black/40',
        hoverEffect &&
          'transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-lg dark:hover:bg-black/50',
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
      {/* Subtle Gradient Glow */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
    </motion.div>
  )
}
