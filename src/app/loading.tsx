import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-6 shadow-2xl shadow-slate-900/10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Loading PatientFlow AI…</p>
      </div>
    </div>
  )
}
