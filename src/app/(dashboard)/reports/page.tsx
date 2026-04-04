'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { DateRangeSelector } from '@/components/reports/date-range-selector'
import { OverviewMetrics } from '@/components/reports/overview-metrics'
import { NoShowRateChart } from '@/components/reports/no-show-rate-chart'
import { AppointmentsTrendChart } from '@/components/reports/appointments-trend-chart'
import { useReportOverview, useNoShowReport, useAppointmentReport } from '@/hooks/use-reports'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { ExportButton } from '@/components/shared/export-button'
import { ExportReportDialog } from '@/components/reports/export-report-dialog'
import { useExportReport } from '@/hooks/use-export'
import { useToast } from '@/hooks/use-toast'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'

export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [exportOpen, setExportOpen] = React.useState(false)

  const { data: overview, isLoading: overviewLoading } = useReportOverview(date)
  const { data: noShowData, isLoading: noShowLoading } = useNoShowReport(date)
  const { data: apptData, isLoading: apptLoading } = useAppointmentReport(date)

  const exportReport = useExportReport()
  const { toast } = useToast()

  const handleExport = async (type: string, dateFrom: string, dateTo: string) => {
    try {
      await exportReport.mutateAsync({
        format: 'pdf',
        columns: [], // Not used for report
        date_from: dateFrom,
        date_to: dateTo,
      })
      toast({ title: 'Export Successful', description: 'Report downloaded.' })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report.' })
    }
  }

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Reports & Analytics"
        description="Track no-shows, appointment trends, and revenue performance."
        actions={(
          <div className="flex items-center space-x-2">
            <DateRangeSelector date={date} setDate={setDate} />
            <ExportButton onExport={() => setExportOpen(true)} label="Export Report" formats={['pdf']} />
          </div>
        )}
      />

      <div className="space-y-4">
        <OverviewMetrics data={overview} isLoading={overviewLoading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>No-Show Trends</CardTitle>
              <Link href="/reports/no-shows">
                <Button variant="ghost" size="sm">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <NoShowRateChart data={noShowData?.rate_over_time} isLoading={noShowLoading} />
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
             <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointment Volume</CardTitle>
              <Link href="/reports/appointments">
                <Button variant="ghost" size="sm">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
               {/* Simplified trend for dashboard overview */}
               <AppointmentsTrendChart data={apptData?.over_time} isLoading={apptLoading} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/reports/no-shows" className="block">
            <PageCard className="cursor-pointer hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">No-Show Analysis</CardTitle>
                <CardDescription>Drill down into no-show patterns</CardDescription>
              </CardHeader>
            </PageCard>
          </Link>
          <Link href="/reports/appointments" className="block">
            <PageCard className="cursor-pointer hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Appointment Insights</CardTitle>
                <CardDescription>Volume, times, and sources</CardDescription>
              </CardHeader>
            </PageCard>
          </Link>
          <Link href="/reports/revenue" className="block">
            <PageCard className="cursor-pointer hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue & Deposits</CardTitle>
                <CardDescription>Track collections and savings</CardDescription>
              </CardHeader>
            </PageCard>
          </Link>
          <Link href="/reports/staff-performance" className="block lg:col-span-1">
            <PageCard className="cursor-pointer border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
              <CardHeader>
                <CardTitle className="text-sm font-black text-emerald-600 flex items-center gap-2">
                  <Plus className="h-3 w-3" /> Staff Conversion
                </CardTitle>
                <CardDescription className="text-emerald-900/60 font-medium">Doctor-level revenue tracking</CardDescription>
              </CardHeader>
            </PageCard>
          </Link>
        </div>
      </div>

      <ExportReportDialog 
        open={exportOpen} 
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </PageContainer>
  )
}
