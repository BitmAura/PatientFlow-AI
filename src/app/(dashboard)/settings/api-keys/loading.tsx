export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="h-9 w-24 bg-muted rounded-lg" />
      </div>
      <div className="h-14 bg-muted rounded-xl" />
      {[1, 2].map(i => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  )
}
