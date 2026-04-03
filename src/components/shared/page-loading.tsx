import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[130px] rounded-2xl border border-border/50" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <Skeleton className="h-[420px] rounded-2xl border border-border/50 xl:col-span-4" />
        <Skeleton className="h-[420px] rounded-2xl border border-border/50 xl:col-span-3" />
      </div>
    </div>
  )
}
