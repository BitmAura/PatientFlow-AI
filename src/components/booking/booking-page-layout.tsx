import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface BookingPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function BookingPageLayout({ children, className }: BookingPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className={cn(
        "w-full max-w-md bg-white rounded-lg shadow-sm overflow-hidden min-h-[600px] flex flex-col",
        className
      )}>
        {children}
      </div>
    </div>
  )
}
