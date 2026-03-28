import { Suspense } from 'react'
import { NewPatientForm } from './new-patient-form'

/**
 * Server Component boundary: `useSearchParams` inside NewPatientForm must suspend
 * from a parent `<Suspense>` that is not only inside the same client file (Next.js 15).
 */
export default function NewPatientPage() {
  return (
    <Suspense fallback={<NewPatientSkeleton />}>
      <NewPatientForm />
    </Suspense>
  )
}

function NewPatientSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}
