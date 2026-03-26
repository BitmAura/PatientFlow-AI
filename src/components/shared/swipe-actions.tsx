import * as React from 'react'
import { useSwipeGesture } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils/cn'

interface SwipeActionsProps {
  children: React.ReactNode
  leftAction?: {
    label?: string
    icon?: React.ReactNode
    color: string
    onClick: () => void
  }
  rightAction?: {
    label?: string
    icon?: React.ReactNode
    color: string
    onClick: () => void
  }
}

export function SwipeActions({ children, leftAction, rightAction }: SwipeActionsProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [offset, setOffset] = React.useState(0)

  useSwipeGesture(ref, {
    onSwipeLeft: () => {
      if (rightAction) setOffset(-100)
    },
    onSwipeRight: () => {
      if (leftAction) setOffset(100)
    }
  })

  // Auto-close after action or delay
  React.useEffect(() => {
    if (offset !== 0) {
      const timer = setTimeout(() => setOffset(0), 3000)
      return () => clearTimeout(timer)
    }
  }, [offset])

  return (
    <div className="relative overflow-hidden mb-2 rounded-lg">
      {/* Background Actions */}
      <div className="absolute inset-0 flex text-white font-medium text-sm">
        {leftAction && (
          <div 
            className={cn("flex-1 flex items-center pl-6 transition-opacity gap-2", leftAction.color)}
            style={{ opacity: offset > 0 ? 1 : 0 }}
            onClick={() => {
              leftAction.onClick()
              setOffset(0)
            }}
          >
            {leftAction.icon}
            {leftAction.label}
          </div>
        )}
        {rightAction && (
          <div 
            className={cn("flex-1 flex items-center justify-end pr-6 transition-opacity gap-2", rightAction.color)}
            style={{ opacity: offset < 0 ? 1 : 0 }}
            onClick={() => {
              rightAction.onClick()
              setOffset(0)
            }}
          >
            {rightAction.label}
            {rightAction.icon}
          </div>
        )}
      </div>

      {/* Foreground Content */}
      <div 
        ref={ref}
        className="relative bg-white transition-transform duration-300 ease-out touch-pan-y"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
