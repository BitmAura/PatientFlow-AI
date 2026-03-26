import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fullWidth?: boolean
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 space-y-4 p-4 md:p-8 pt-6",
        !fullWidth && "max-w-7xl mx-auto w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
