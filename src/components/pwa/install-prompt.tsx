'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa'
import { cn } from '@/lib/utils/cn'

export function InstallPrompt() {
  const { canInstall, install, dismiss } = usePWAInstall()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (canInstall) {
      // Small delay to not annoy user immediately
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [canInstall])

  if (!canInstall || !isVisible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 md:bottom-4 md:left-auto md:right-4 md:w-96">
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xl flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              PF
            </div>
            <div>
              <h4 className="font-semibold text-sm">Install PatientFlow AI</h4>
              <p className="text-xs text-muted-foreground">
                Add to Home Screen for quick access and offline support.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false)
              dismiss()
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={install}>
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            setIsVisible(false)
            dismiss()
          }}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  )
}
