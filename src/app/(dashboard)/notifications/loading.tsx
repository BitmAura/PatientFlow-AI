import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="space-y-5 p-1">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden divide-y">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-4">
            <Skeleton className="h-9 w-9 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
