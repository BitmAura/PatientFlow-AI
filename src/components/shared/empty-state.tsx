import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: () => void
  actionLabel?: string
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200",
      className
    )}>
      {Icon && (
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
