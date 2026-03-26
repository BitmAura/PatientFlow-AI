import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Megaphone, Send, MessageSquare, CalendarCheck } from 'lucide-react'

interface CampaignStatsCardsProps {
  stats?: any
}

export function CampaignStatsCards({ stats }: CampaignStatsCardsProps) {
  if (!stats) return null

  const items = [
    { label: 'Total Campaigns', value: stats.total_campaigns, icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Messages Sent', value: stats.messages_sent, icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Response Rate', value: `${stats.response_rate}%`, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Bookings', value: stats.bookings_generated, icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
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
