import * as React from 'react'
import { usePullToRefresh } from '@/hooks/use-mobile'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { isRefreshing } = usePullToRefresh(onRefresh)

  return (
    <div className="relative min-h-screen">
      <div 
        className={cn(
          "absolute left-0 right-0 flex justify-center transition-all duration-300 pointer-events-none",
          isRefreshing ? "top-4 opacity-100" : "-top-10 opacity-0"
        )}
      >
        <div className="bg-white rounded-full p-2 shadow-md border">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      </div>
      {children}
    </div>
  )
}
