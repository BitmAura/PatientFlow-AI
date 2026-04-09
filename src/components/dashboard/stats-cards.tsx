'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Keep for internal padding if needed, or just use divs
import { useStats } from '@/hooks/use-stats'
import {
  Users,
  CalendarCheck,
  ShieldCheck,
  IndianRupee,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Skeleton } from '@/components/ui/skeleton'
import { TwentyOneCard } from '@/components/ui/twentyone-card'

export function StatsCards() {
  const { data: stats, isLoading } = useStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const items: Array<{
    title: string
    value: number | string
    description: string
    icon: typeof Users
    trend: number
    inverseTrend?: boolean
    color: string
    sparkline: string
  }> = [
    {
      title: "Today's Appointments",
      value: stats.today_appointments_count,
      description: `${stats.today_no_shows_count} no-shows detected today`,
      icon: CalendarCheck,
      trend: 0,
      color: 'text-primary',
      sparkline: 'M0 10 L 10 10 L 20 5 L 30 8 L 40 2 L 50 5',
    },
    {
      title: "Today's Leads",
      value: stats.today_leads_count,
      description: `New prospects today`,
      icon: Users,
      trend: 12,
      color: 'text-emerald-600',
      sparkline: 'M0 10 L 10 8 L 20 6 L 30 4 L 40 5 L 50 1',
    },
    {
      title: "Today's No-Shows",
      value: stats.today_no_shows_count,
      description: `Target high risk patients`,
      icon: ShieldCheck,
      trend: 0,
      inverseTrend: true,
      color: 'text-red-500',
      sparkline: 'M0 5 L 10 5 L 20 5 L 30 8 L 40 10 L 50 10',
    },
    {
      title: "Revenue Recovered",
      value: formatCurrency(stats.today_revenue_recovered),
      description: `Recovered today via confirmed appts`,
      icon: IndianRupee,
      trend: 8,
      color: 'text-slate-600',
      sparkline: 'M0 10 L 10 9 L 20 7 L 30 6 L 40 3 L 50 0',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.title}>
          <TwentyOneCard className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-transparent pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <div
                className={`rounded-lg bg-opacity-10 p-2 ${item.color.replace('text-', 'bg-')}`}
              >
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold tracking-tight">
                    {item.value}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {/* Micro Sparkline */}
                <svg
                  className="h-8 w-16 opacity-20 transition-opacity group-hover:opacity-40"
                  viewBox="0 0 50 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d={item.sparkline}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={item.color}
                  />
                </svg>
              </div>

              {/* Trend Indicator */}
              {item.trend !== 0 && (
                <div
                  className={`mt-3 flex items-center text-xs font-medium ${
                    (item.trend > 0 && !item.inverseTrend) ||
                    (item.trend < 0 && Boolean(item.inverseTrend))
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                      : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                  } w-fit rounded-full px-2 py-0.5`}
                >
                  {item.trend > 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(item.trend)}%
                </div>
              )}
            </CardContent>

          </TwentyOneCard>
        </div>
      ))}
    </div>
  )
}
