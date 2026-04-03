'use client'

import * as React from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = React.useState(false)

  React.useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }

    function handleOffline() {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/20">
        <WifiOff className="w-4 h-4" />
        <span>You are currently offline</span>
      </div>
    </div>
  )
}
