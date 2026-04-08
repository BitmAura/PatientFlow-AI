'use client'

import * as React from 'react'
import { capturePostHogException } from '@/lib/posthog-client'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    capturePostHogException(error, { source: 'dashboard_error' })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>

        {/* Message */}
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          This page ran into an unexpected error. Your data is safe — just try
          reloading or go back to the dashboard.
        </p>

        {/* Error ref */}
        {error.digest && (
          <p className="mb-6 text-xs text-slate-400">
            Reference:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              {error.digest}
            </code>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Dev details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 rounded-xl border bg-slate-50 p-4 text-left dark:bg-slate-900">
            <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700">
              Error details (dev only)
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-600 dark:text-red-400">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
