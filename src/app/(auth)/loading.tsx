import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-1/2 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
