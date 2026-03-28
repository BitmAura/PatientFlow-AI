'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DateRangeSelector } from '@/components/reports/date-range-selector'
import { DepositsChart } from '@/components/reports/deposits-chart'
import { MetricCard } from '@/components/reports/metric-card'
import { ExportReportButton } from '@/components/reports/export-report-button'
import { useRevenueReport } from '@/hooks/use-reports'
import { DollarSign, RefreshCw, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader } from '@/components/dashboard/PageStructure'

export default function RevenueReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useRevenueReport(date)

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Revenue & Deposits"
        description="Track financial performance from deposits."
        actions={
          <div className="flex items-center space-x-2">
            <DateRangeSelector date={date} setDate={setDate} />
            <ExportReportButton reportType="Revenue" data={data} dateRange={date as any} />
          </div>
        }
      />

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
    </PageContainer>
  )
}