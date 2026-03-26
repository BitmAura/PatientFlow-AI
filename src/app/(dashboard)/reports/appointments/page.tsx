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
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AppointmentsReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useAppointmentReport(date)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Appointment Insights</h2>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <p className="text-muted-foreground">Volume, status breakdown, and operational heatmaps.</p>
        <div className="flex items-center space-x-2">
          <DateRangeSelector date={date} setDate={setDate} />
          <ExportReportButton reportType="Appointments" data={data} dateRange={date as any} />
        </div>
      </div>

      <div className="space-y-4">
        <AppointmentsTrendChart data={data?.over_time} isLoading={isLoading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AppointmentsByStatusChart data={data?.by_status} isLoading={isLoading} />
          <BookingSourcesChart data={data?.by_source} isLoading={isLoading} />
        </div>

        <BusiestTimesHeatmap data={data?.by_hour} isLoading={isLoading} />
      </div>
    </div>
  )
}