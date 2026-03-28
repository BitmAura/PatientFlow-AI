'use client'

import * as React from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
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
    <html>
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px',
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1>Something went wrong</h1>
          <p>Please try again. If the issue persists, contact support.</p>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
