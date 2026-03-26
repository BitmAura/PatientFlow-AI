import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Send, CheckCheck, Eye, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'
import { ReminderStats } from '@/hooks/use-reminder-logs'
import { Skeleton } from '@/components/ui/skeleton'

interface ReminderStatsCardsProps {
  stats?: ReminderStats
  isLoading: boolean
}

export function ReminderStatsCards({ stats, isLoading }: ReminderStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items = [
    {
      label: 'Sent Today',
      value: stats.sent_today,
      trend: stats.trends.sent,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Delivery Rate',
      value: `${stats.delivery_rate}%`,
      trend: stats.trends.delivery,
      icon: CheckCheck,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Read Rate',
      value: `${stats.read_rate}%`,
      trend: stats.trends.read,
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Response Rate',
      value: `${stats.response_rate}%`,
      trend: stats.trends.response,
      icon: MessageSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              {item.trend !== 0 && (
                <div className={`flex items-center text-xs font-medium ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(item.trend)}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <h3 className="text-2xl font-bold">{item.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
