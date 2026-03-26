'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DateRangeSelector } from '@/components/reports/date-range-selector'
import { DepositsChart } from '@/components/reports/deposits-chart'
import { MetricCard } from '@/components/reports/metric-card'
import { ExportReportButton } from '@/components/reports/export-report-button'
import { useRevenueReport } from '@/hooks/use-reports'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, RefreshCw, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import Link from 'next/link'

export default function RevenueReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useRevenueReport(date)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Revenue & Deposits</h2>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <p className="text-muted-foreground">Track financial performance from deposits.</p>
        <div className="flex items-center space-x-2">
          <DateRangeSelector date={date} setDate={setDate} />
          <ExportReportButton reportType="Revenue" data={data} dateRange={date as any} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Deposits" 
            value={formatCurrency(data?.total_deposits || 0)} 
            icon={DollarSign} 
            loading={isLoading}
          />
          <MetricCard 
            title="Pending Refunds" 
            value={formatCurrency(data?.pending_refunds || 0)} 
            icon={RefreshCw} 
            loading={isLoading}
          />
          <MetricCard 
            title="No-Show Deposits" 
            value={formatCurrency(data?.no_show_deposits || 0)} 
            icon={AlertCircle} 
            loading={isLoading}
          />
          <MetricCard 
            title="Successful Deposits" 
            value={formatCurrency(data?.successful_deposits || 0)} 
            icon={DollarSign} 
            loading={isLoading}
          />
        </div>
        
        <DepositsChart data={data?.daily_deposits} isLoading={isLoading} />
      </div>
    </div>
  )
}