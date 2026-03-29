'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ReminderStatsCards } from '@/components/reminders/reminder-stats-cards'
import { ReminderLogTable } from '@/components/reminders/reminder-log-table'
import { ReminderLogFilters } from '@/components/reminders/reminder-log-filters'
import { useReminderLogs, useReminderStats } from '@/hooks/use-reminder-logs'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ReminderLogsPage() {
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
    search: '',
    statuses: undefined as string[] | undefined,
    types: undefined as string[] | undefined,
    date_from: undefined,
    date_to: undefined
  })

  const { data: logsData, isLoading: logsLoading } = useReminderLogs(filters)
  const { data: statsData, isLoading: statsLoading } = useReminderStats()
  const { toast } = useToast()

  const handleExport = () => {
    const rows = logsData?.data || []
    if (rows.length === 0) {
      toast({ variant: 'destructive', title: 'No data', description: 'No logs available to export.' })
      return
    }

    const header = ['Sent At', 'Patient', 'Phone', 'Type', 'Status', 'Message']
    const escapeCsv = (value: string) => {
      const safe = String(value ?? '')
      if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
        return `"${safe.replace(/"/g, '""')}"`
      }
      return safe
    }

    const csvRows = rows.map((log: any) => [
      new Date(log.created_at).toISOString(),
      log.patients?.full_name || '',
      log.patients?.phone || '',
      log.type,
      log.status,
      log.message || log.content || '',
    ])

    const csv = [header, ...csvRows].map((row) => row.map((item) => escapeCsv(String(item))).join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reminder-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminder Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track message delivery and patient responses in real-time.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-8">
        <ReminderStatsCards stats={statsData} isLoading={statsLoading} />
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <ReminderLogFilters 
            filters={filters} 
            onFilterChange={setFilters}
            onClear={() =>
              setFilters({
                page: 1,
                limit: 20,
                search: '',
                statuses: undefined,
                types: undefined,
                date_from: undefined,
                date_to: undefined,
              })
            }
          />
          
          <ReminderLogTable 
            data={logsData?.data || []} 
            isLoading={logsLoading} 
          />
          
          {/* Pagination Controls */}
          {logsData?.meta && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">
                Page {filters.page} of {logsData.meta.totalPages} ({logsData.meta.total} results)
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  disabled={filters.page >= logsData.meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
