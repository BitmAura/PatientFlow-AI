'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HeartPulse,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useRevenueRecovery, RecoveryPeriod } from '@/hooks/use-revenue-recovery'
import { cn } from '@/lib/utils/cn'

function formatInr(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function RevenueImpactPanel() {
  const [period, setPeriod] = React.useState<RecoveryPeriod>('month')
  const { data, isLoading, refetch } = useRevenueRecovery(period)
  const s = data?.summary

  const totalRecovered = s?.total_recovered_revenue ?? 0
  const hasData = totalRecovered > 0 || (s?.total_recalls_sent ?? 0) > 0

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Revenue Impact</h2>
          <p className="text-sm text-muted-foreground">
            Money PatientFlow AI directly recovered for your clinic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-lg border overflow-hidden text-xs">
            {(['month', 'quarter', 'year'] as RecoveryPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 font-medium capitalize transition-colors',
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                {p === 'month' ? 'This month' : p === 'quarter' ? 'Quarter' : 'Year'}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Hero recovery card */}
      <Card className={cn(
        'border-l-4 transition-colors',
        totalRecovered > 0
          ? 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800'
          : 'border-l-slate-300 bg-muted/30'
      )}>
        <CardContent className="pt-5 pb-4">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total recovered · {data?.period_label}
                </p>
                <p className={cn(
                  'text-3xl font-bold tracking-tight',
                  totalRecovered > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'
                )}>
                  {totalRecovered > 0 ? formatInr(totalRecovered) : '₹0'}
                </p>
                {!hasData && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recovered revenue will show once recalls and no-show follow-ups complete.
                  </p>
                )}
              </div>
              <div className="text-right space-y-1">
                {s?.recall_growth_vs_prev !== null && s?.recall_growth_vs_prev !== undefined && (
                  <Badge className={cn(
                    'text-xs',
                    s.recall_growth_vs_prev >= 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  )}>
                    {s.recall_growth_vs_prev >= 0 ? '+' : ''}{s.recall_growth_vs_prev}% vs prev period
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild className="text-xs gap-1 h-7">
                  <Link href="/reports/revenue-recovery">
                    Full breakdown <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          label="Recall patients returned"
          value={isLoading ? null : (s?.recall_patients_returned ?? 0).toString()}
          helper={`${s?.recall_conversion_rate ?? 0}% conversion rate · ${s?.total_recalls_sent ?? 0} sent`}
          subValue={s?.recall_revenue ? formatInr(s.recall_revenue) + ' recovered' : undefined}
          icon={HeartPulse}
          tone="text-emerald-600"
        />
        <KPICard
          label="No-shows recovered"
          value={isLoading ? null : (s?.noshow_patients_recovered ?? 0).toString()}
          helper={`${s?.noshow_recovery_rate ?? 0}% recovery rate · ${s?.total_no_shows ?? 0} total no-shows`}
          subValue={s?.noshow_recovery_revenue ? formatInr(s.noshow_recovery_revenue) + ' rebooked' : undefined}
          icon={TrendingDown}
          tone="text-violet-600"
        />
        <KPICard
          label="Revenue per recall sent"
          value={isLoading
            ? null
            : (s?.total_recalls_sent ?? 0) > 0
              ? formatInr(Math.round((s?.recall_revenue ?? 0) / s!.total_recalls_sent))
              : '—'}
          helper="Average return per recall message sent"
          icon={IndianRupee}
          tone="text-blue-600"
          highlight={
            s && s.total_recalls_sent > 0
              ? (s.recall_revenue / s.total_recalls_sent) > 200
              : false
          }
        />
      </div>
    </section>
  )
}

function KPICard({
  label,
  value,
  helper,
  subValue,
  icon: Icon,
  tone,
  highlight = false,
}: {
  label: string
  value: string | null
  helper: string
  subValue?: string
  icon: React.ElementType
  tone: string
  highlight?: boolean
}) {
  return (
    <Card className={cn('border-border/60 bg-card/70', highlight && 'border-blue-200 dark:border-blue-800')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={cn('h-4 w-4', tone)} />
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-2xl font-bold tracking-tight">{value}</div>
        )}
        {subValue && (
          <p className={cn('mt-0.5 text-xs font-medium', tone)}>{subValue}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}
