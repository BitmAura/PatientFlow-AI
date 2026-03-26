import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface FollowupStatsCardsProps {
  stats?: any
}

export function FollowupStatsCards({ stats }: FollowupStatsCardsProps) {
  if (!stats) return null

  const items = [
    { 
      label: 'Due Today', 
      value: stats.due_today, 
      icon: Calendar, 
      color: stats.due_today > 0 ? 'text-amber-600' : 'text-gray-500', 
      bg: stats.due_today > 0 ? 'bg-amber-50' : 'bg-gray-50' 
    },
    { 
      label: 'Due This Week', 
      value: stats.due_this_week, 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Overdue', 
      value: stats.overdue, 
      icon: AlertCircle, 
      color: stats.overdue > 0 ? 'text-red-600' : 'text-gray-500', 
      bg: stats.overdue > 0 ? 'bg-red-50' : 'bg-gray-50' 
    },
    { 
      label: 'Completed', 
      value: stats.completed_this_month, 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
              <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
