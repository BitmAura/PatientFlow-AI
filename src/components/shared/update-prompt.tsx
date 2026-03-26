'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [wb, setWb] = React.useState<any>(null)

  React.useEffect(() => {
    // Basic service worker registration check
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Logic would typically involve Workbox window or manual registration handling
      // For now, we simulate this if a new version is detected
    }
  }, [])

  const handleUpdate = () => {
    if (wb) {
      wb.messageSkipWaiting()
    }
    window.location.reload()
  }

  if (!showPrompt) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1">Update Available</h4>
            <p className="text-xs text-muted-foreground mb-3">
              A new version of Aura is available. Update now to get the latest features.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate}>Update Now</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>Later</Button>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
