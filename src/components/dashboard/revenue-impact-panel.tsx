'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStats } from '@/hooks/use-stats'
import { HeartPulse, IndianRupee, TrendingDown } from 'lucide-react'

function formatInrAmount(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))
}

export function RevenueImpactPanel() {
  const { data: stats } = useStats()

  const weeklyCompletedPatients = stats?.week_completed_count ?? 0
  const patientsRecoveredThisMonth = Math.max(
    Math.round(weeklyCompletedPatients * 4.3),
    weeklyCompletedPatients
  )
  const revenueGeneratedViaSystem = Math.round(
    stats?.deposits_collected_this_month ?? 0
  )
  const noShowsReducedPercent = Math.max(
    (stats?.no_show_rate_last_month ?? 0) - (stats?.no_show_rate_current_month ?? 0),
    0
  )

  const kpis = [
    {
      label: 'Patients recovered this month',
      value: patientsRecoveredThisMonth.toLocaleString('en-IN'),
      helper: 'Recovered through recalls, reminders, and follow-ups',
      icon: HeartPulse,
      tone: 'text-emerald-600',
    },
    {
      label: 'Revenue generated via system',
      value: formatInrAmount(revenueGeneratedViaSystem),
      helper: 'Directly tracked from this month deposits',
      icon: IndianRupee,
      tone: 'text-blue-600',
    },
    {
      label: 'No-shows reduced',
      value: `${noShowsReducedPercent.toFixed(1)}%`,
      helper: 'Compared to last month',
      icon: TrendingDown,
      tone: 'text-violet-600',
    },
  ]

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Performance Insights
        </h2>
        <p className="text-sm text-muted-foreground">
          Make your product feel like an investment, not an expense.
        </p>
      </div>

      <Card className="border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30">
        <CardContent className="pt-6">
          <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
            {`This system generated ${formatInrAmount(revenueGeneratedViaSystem)} for you this month`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-border/60 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
