import { Skeleton } from '@/components/ui/skeleton'

export default function ReminderSettingsLoading() {
  return (
    <div className="space-y-5 p-1">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Toggle rows */}
      <div className="rounded-xl border bg-card divide-y overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>

      {/* Template editor */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}
