'use client'

import * as React from 'react'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-pwa'

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus()
  
  if (isOnline) return null

  return (
    <div className="fixed bottom-20 left-4 z-50 md:bottom-4 animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        <div>
          <p>You&apos;re offline</p>
          <p className="text-xs text-slate-400 font-normal">Some features may be unavailable.</p>
        </div>
      </div>
    </div>
  )
}
