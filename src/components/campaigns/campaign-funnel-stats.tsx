import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Send, CheckCheck, Eye, MessageSquare, CalendarCheck } from 'lucide-react'

interface CampaignFunnelStatsProps {
  stats: any
}

export function CampaignFunnelStats({ stats }: CampaignFunnelStatsProps) {
  if (!stats) return null

  // Calculate percentages
  const sentPct = stats.recipients ? Math.round((stats.sent / stats.recipients) * 100) : 0
  const deliveredPct = stats.sent ? Math.round((stats.delivered / stats.sent) * 100) : 0
  const readPct = stats.delivered ? Math.round((stats.read / stats.delivered) * 100) : 0
  const responsePct = stats.read ? Math.round((stats.responded / stats.read) * 100) : 0
  const bookedPct = stats.responded ? Math.round((stats.booked / stats.responded) * 100) : 0

  const cards = [
    { label: 'Recipients', value: stats.recipients, sub: 'Target', icon: Users, color: 'text-gray-500' },
    { label: 'Sent', value: stats.sent, sub: `${sentPct}%`, icon: Send, color: 'text-blue-500' },
    { label: 'Delivered', value: stats.delivered, sub: `${deliveredPct}%`, icon: CheckCheck, color: 'text-green-500' },
    { label: 'Read', value: stats.read, sub: `${readPct}%`, icon: Eye, color: 'text-purple-500' },
    { label: 'Responded', value: stats.responded, sub: `${responsePct}%`, icon: MessageSquare, color: 'text-orange-500' },
    { label: 'Booked', value: stats.booked, sub: `${bookedPct}%`, icon: CalendarCheck, color: 'text-pink-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <Card key={card.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              {i > 0 && (
                <span className="text-xs text-muted-foreground font-mono">{card.sub}</span>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{card.value}</h3>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
          {/* Funnel Connector Visual */}
          {i < cards.length - 1 && (
            <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 bg-background rotate-45 border-r border-t z-10" />
          )}
        </Card>
      ))}
    </div>
  )
}
