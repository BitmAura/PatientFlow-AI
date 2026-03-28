'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DateRangeSelector } from '@/components/reports/date-range-selector'
import { AppointmentsTrendChart } from '@/components/reports/appointments-trend-chart'
import { AppointmentsByStatusChart } from '@/components/reports/appointments-by-status-chart'
import { BusiestTimesHeatmap } from '@/components/reports/busiest-times-heatmap'
import { BookingSourcesChart } from '@/components/reports/booking-sources-chart'
import { ExportReportButton } from '@/components/reports/export-report-button'
import { useAppointmentReport } from '@/hooks/use-reports'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader } from '@/components/dashboard/PageStructure'

export default function AppointmentsReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useAppointmentReport(date)

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Appointment Insights"
        description="Volume, status breakdown, and operational heatmaps."
        actions={
          <div className="flex items-center space-x-2">
            <DateRangeSelector date={date} setDate={setDate} />
            <ExportReportButton reportType="Appointments" data={data} dateRange={date as any} />
          </div>
        }
      />

      <div className="space-y-4">
        <AppointmentsTrendChart data={data?.over_time} isLoading={isLoading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AppointmentsByStatusChart data={data?.by_status} isLoading={isLoading} />
          <BookingSourcesChart data={data?.by_source} isLoading={isLoading} />
        </div>

        <BusiestTimesHeatmap data={data?.by_hour} isLoading={isLoading} />
      </div>
    </PageContainer>
  )
}