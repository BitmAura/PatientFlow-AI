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
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NoShowsReportPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const { data, isLoading } = useNoShowReport(date)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">No-Show Analysis</h2>
      </div>
      
      <div className="flex items-center justify-between space-y-2">
        <p className="text-muted-foreground">Detailed breakdown of missed appointments.</p>
        <div className="flex items-center space-x-2">
          <DateRangeSelector date={date} setDate={setDate} />
          <ExportReportButton reportType="No-Shows" data={data} dateRange={date as any} />
        </div>
      </div>

      <div className="space-y-4">
        <NoShowRateChart data={data?.rate_over_time} isLoading={isLoading} />

        <div className="grid gap-4 md:grid-cols-2">
          <NoShowByDayChart data={data?.by_day} isLoading={isLoading} />
          <NoShowByServiceChart data={data?.by_service} isLoading={isLoading} />
        </div>

        <TopNoShowPatients data={data?.top_patients} isLoading={isLoading} />
      </div>
    </div>
  )
}