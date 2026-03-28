'use client'

import * as React from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 mb-8">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-left overflow-auto max-h-48 text-xs font-mono">
            <p className="font-bold mb-1">Error Details:</p>
            {error.message}
          </div>
        )}
      </div>
    </div>
  )
}
