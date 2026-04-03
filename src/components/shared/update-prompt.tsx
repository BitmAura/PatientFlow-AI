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
      <div className="max-w-sm rounded-2xl border border-border/70 bg-card p-4 shadow-xl shadow-slate-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1">Update Available</h4>
            <p className="text-xs text-muted-foreground mb-3">
              A new version of PatientFlow AI is available. Update now to get the latest features.
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
