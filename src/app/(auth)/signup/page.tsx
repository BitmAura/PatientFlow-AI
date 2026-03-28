import { Suspense } from 'react'
import { SignupView } from './signup-view'

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center px-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignupView />
    </Suspense>
  )
}
