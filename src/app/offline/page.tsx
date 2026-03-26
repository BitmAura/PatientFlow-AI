'use client'

import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-gray-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You are offline</h2>
        <p className="text-gray-500 mb-8">
          It seems you lost your internet connection. Some features may not be available.
        </p>

        <Button onClick={() => window.location.reload()} className="w-full gap-2 mb-3">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
