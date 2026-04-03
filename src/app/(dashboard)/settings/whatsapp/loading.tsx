import { Skeleton } from '@/components/ui/skeleton'

export default function WhatsAppSettingsLoading() {
  return (
    <div className="space-y-5 p-1">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Main connect card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-11 rounded-lg" />)}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Status card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <Skeleton className="h-5 w-36" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
