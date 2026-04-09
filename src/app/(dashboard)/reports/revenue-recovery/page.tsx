'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { IndianRupee, HeartPulse, TrendingDown, ArrowLeft, RefreshCw, Download } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils/cn'
import { useRevenueRecovery, RecoveryPeriod } from '@/hooks/use-revenue-recovery'
import Link from 'next/link'

function formatInr(v: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.max(0, v))
}

export default function RevenueRecoveryPage() {
  const [period, setPeriod] = React.useState<RecoveryPeriod>('month')
  const { data, isLoading, refetch } = useRevenueRecovery(period)
  const s = data?.summary

  return (
    <PageContainer>
      <Breadcrumbs />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue Recovery</h1>
            <p className="mt-0.5 text-muted-foreground text-sm">
              Exact money PatientFlow AI recovered through recalls and no-show follow-ups.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period label */}
      {data && (
        <p className="mb-4 text-xs text-muted-foreground font-medium">
          Showing data for: {data.period_label}
        </p>
      )}

      {/* Summary KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total recovered"
          value={isLoading ? null : formatInr(s?.total_recovered_revenue ?? 0)}
          icon={IndianRupee}
          accent="emerald"
          large
        />
        <SummaryCard
          label="Via recalls"
          value={isLoading ? null : formatInr(s?.recall_revenue ?? 0)}
          sub={`${s?.recall_patients_returned ?? 0} patients`}
          icon={HeartPulse}
          accent="blue"
        />
        <SummaryCard
          label="Via no-show recovery"
          value={isLoading ? null : formatInr(s?.noshow_recovery_revenue ?? 0)}
          sub={`${s?.noshow_patients_recovered ?? 0} rescheduled`}
          icon={TrendingDown}
          accent="violet"
        />
        <SummaryCard
          label="Recall ROI"
          value={isLoading || !s?.total_recalls_sent
            ? null
            : `${s.total_recalls_sent > 0 ? formatInr(Math.round((s.recall_revenue) / s.total_recalls_sent)) : '—'} / msg`}
          sub={`${s?.recall_conversion_rate ?? 0}% conversion`}
          icon={IndianRupee}
          accent="orange"
        />
      </div>

      {/* Recall details table */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recalled Patients Who Returned</h2>
            <p className="text-xs text-muted-foreground">
              Patients with completed recall → completed appointment in the same period.
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {data?.recall_details.length ?? 0} patients
          </Badge>
        </div>

        <Card>
          {isLoading ? (
            <CardContent className="pt-6 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </CardContent>
          ) : !data?.recall_details.length ? (
            <CardContent className="py-10 text-center">
              <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No recall conversions this period yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Recalls that result in a completed appointment will appear here.
              </p>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Contacted</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recall_details.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium capitalize">{row.treatment_category}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(row.contacted_at), 'MMM d')}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(row.appointment_date), 'MMM d')}
                    </TableCell>
                    <TableCell>{row.service_name}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatInr(row.service_price)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell colSpan={4}>Total recall revenue</TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {formatInr(data.recall_details.reduce((sum, r) => sum + r.service_price, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* No-show recovery table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">No-Show Patients Who Rescheduled</h2>
            <p className="text-xs text-muted-foreground">
              No-shows that rebooked and completed an appointment within 30 days.
            </p>
          </div>
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {data?.noshow_details.length ?? 0} recovered
          </Badge>
        </div>

        <Card>
          {isLoading ? (
            <CardContent className="pt-6 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </CardContent>
          ) : !data?.noshow_details.length ? (
            <CardContent className="py-10 text-center">
              <TrendingDown className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No rescheduled no-shows this period.</p>
              <p className="text-xs text-muted-foreground mt-1">
                When no-show patients rebook and complete their appointment, revenue appears here.
              </p>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No-show date</TableHead>
                  <TableHead>Rebooked</TableHead>
                  <TableHead>Days to rebook</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.noshow_details.map((row, i) => {
                  const daysDiff = Math.round(
                    (new Date(row.rebooked_date).getTime() - new Date(row.noshow_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                  )
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(row.noshow_date), 'MMM d')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(row.rebooked_date), 'MMM d')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{daysDiff}d later</Badge>
                      </TableCell>
                      <TableCell>{row.service_name}</TableCell>
                      <TableCell className="text-right font-semibold text-violet-600">
                        {formatInr(row.service_price)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell colSpan={4}>Total no-show recovery revenue</TableCell>
                  <TableCell className="text-right text-violet-600">
                    {formatInr(data.noshow_details.reduce((sum, r) => sum + r.service_price, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* ROI callout */}
      {s && s.total_recovered_revenue > 0 && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <p className="text-sm font-semibold text-primary">
              PatientFlow AI recovered {formatInr(s.total_recovered_revenue)} for you this{' '}
              {period === 'month' ? 'month' : period === 'quarter' ? 'quarter' : 'year'}.
              {s.total_recovered_revenue >= 2999 && (
                <span className="text-muted-foreground font-normal ml-1">
                  That's {Math.floor(s.total_recovered_revenue / 2999)}× your monthly subscription cost.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}

function SummaryCard({
  label, value, sub, icon: Icon, accent, large = false,
}: {
  label: string; value: string | null; sub?: string
  icon: React.ElementType; accent: string; large?: boolean
}) {
  const colors: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
    orange: 'text-orange-600',
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
        <Icon className={cn('h-4 w-4', colors[accent])} />
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className={cn('w-28', large ? 'h-9' : 'h-7')} />
        ) : (
          <p className={cn('font-bold tracking-tight', large ? 'text-3xl' : 'text-2xl', colors[accent])}>
            {value}
          </p>
        )}
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
