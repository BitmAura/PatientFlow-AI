'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BusiestTimesHeatmapProps {
  data: { day: number, hour: number, count: number }[]
  isLoading?: boolean
}

export function BusiestTimesHeatmap({ data, isLoading }: BusiestTimesHeatmapProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 10 }, (_, i) => i + 9) // 9AM to 6PM

  const maxCount = Math.max(...(data.map(d => d.count) || [0]))

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    const intensity = maxCount > 0 ? count / maxCount : 0
    if (intensity < 0.25) return 'bg-blue-100'
    if (intensity < 0.5) return 'bg-blue-300'
    if (intensity < 0.75) return 'bg-blue-500'
    return 'bg-blue-700'
  }

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Busiest Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Header Row */}
          <div className="flex gap-1">
            <div className="w-8" /> {/* Y-axis label spacer */}
            {hours.map(h => (
              <div key={h} className="flex-1 text-center text-xs text-muted-foreground">
                {h}
              </div>
            ))}
          </div>
          
          {/* Rows */}
          {days.map((dayName, dayIndex) => {
             // Skip Sunday if closed (optional logic)
             if (dayName === 'Sun') return null

             return (
              <div key={dayName} className="flex gap-1 h-8">
                <div className="w-8 text-xs text-muted-foreground flex items-center justify-end pr-2">
                  {dayName}
                </div>
                {hours.map(hour => {
                  const cell = data.find(d => d.day === dayIndex && d.hour === hour)
                  const count = cell?.count || 0
                  
                  return (
                    <TooltipProvider key={hour}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`flex-1 rounded-sm ${getColor(count)} hover:ring-2 ring-offset-1 ring-blue-500 transition-all cursor-default`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{dayName} at {hour}:00</p>
                          <p>{count} appointments</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
             )
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
             <div className="w-3 h-3 bg-blue-100 rounded-sm" />
             <div className="w-3 h-3 bg-blue-300 rounded-sm" />
             <div className="w-3 h-3 bg-blue-500 rounded-sm" />
             <div className="w-3 h-3 bg-blue-700 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
