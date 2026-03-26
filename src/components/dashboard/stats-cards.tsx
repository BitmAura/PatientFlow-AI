'use client'

import * as React from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Keep for internal padding if needed, or just use divs
import { useStats } from '@/hooks/use-stats'
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowUp,
  ArrowDown,
  TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/ui/glass-card'
import { motion } from 'framer-motion'

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

  const items = [
    {
      title: "Today's Appointments",
      value: stats.today_appointments_count,
      description: `${stats.today_confirmed_count} confirmed, ${stats.today_pending_count} pending`,
      icon: Calendar,
      trend: 0,
      color: 'text-blue-500',
      sparkline: 'M0 10 L 10 10 L 20 5 L 30 8 L 40 2 L 50 5',
    },
    {
      title: 'Completed Week',
      value: stats.week_completed_count,
      description: `Out of ${stats.week_appointments_count} scheduled`,
      icon: CheckCircle,
      trend: 12,
      color: 'text-green-500',
      sparkline: 'M0 10 L 10 8 L 20 6 L 30 4 L 40 5 L 50 1',
    },
    {
      title: 'No-Show Rate',
      value: `${stats.no_show_rate_current_month.toFixed(1)}%`,
      description: 'Current month',
      icon: AlertCircle,
      trend: stats.no_show_rate_last_month - stats.no_show_rate_current_month,
      inverseTrend: true,
      color: 'text-red-500',
      sparkline: 'M0 5 L 10 5 L 20 5 L 30 8 L 40 10 L 50 10', // Flat/Bad
    },
    {
      title: 'Revenue (Deposits)',
      value: formatCurrency(stats.deposits_collected_this_month),
      description: `${stats.deposits_count} payments`,
      icon: CreditCard,
      trend: 8,
      color: 'text-purple-500',
      sparkline: 'M0 10 L 10 9 L 20 7 L 30 6 L 40 3 L 50 0',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item, index) => (
        <motion.div key={item.title} variants={itemAnim}>
          <GlassCard className="group relative h-full overflow-hidden">
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
                    (item.trend < 0 && item.inverseTrend)
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

            {/* Hover Glow Effect handled by GlassCard, but we can add more */}
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  )
}
