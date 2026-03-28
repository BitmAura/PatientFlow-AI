'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DateRangeSelector } from '@/components/reports/date-range-selector'
import { NoShowRateChart } from '@/components/reports/no-show-rate-chart'
import { NoShowByDayChart } from '@/components/reports/no-show-by-day-chart'
import { NoShowByServiceChart } from '@/components/reports/no-show-by-service-chart'
import { TopNoShowPatients } from '@/components/reports/top-noshow-patients'
import { ExportReportButton } from '@/components/reports/export-report-button'
import { useNoShowReport } from '@/hooks/use-reports'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader } from '@/components/dashboard/PageStructure'

export default function NoShowsReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useNoShowReport(date)

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="No-Show Analysis"
        description="Detailed breakdown of missed appointments."
        actions={
          <div className="flex items-center space-x-2">
            <DateRangeSelector date={date} setDate={setDate} />
            <ExportReportButton reportType="No-Shows" data={data} dateRange={date as any} />
          </div>
        }
      />

      <div className="space-y-4">
        <NoShowRateChart data={data?.rate_over_time} isLoading={isLoading} />

        <div className="grid gap-4 md:grid-cols-2">
          <NoShowByDayChart data={data?.by_day} isLoading={isLoading} />
          <NoShowByServiceChart data={data?.by_service} isLoading={isLoading} />
        </div>

        <TopNoShowPatients data={data?.top_patients} isLoading={isLoading} />
      </div>
    </PageContainer>
  )
}