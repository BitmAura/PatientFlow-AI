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

export default function ReminderLogsPage() {
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    type: undefined,
    date_from: undefined,
    date_to: undefined
  })

  const { data: logsData, isLoading: logsLoading } = useReminderLogs(filters)
  const { data: statsData, isLoading: statsLoading } = useReminderStats()

  const handleExport = () => {
    // Placeholder for CSV export
    alert('Exporting CSV...')
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
            onClear={() => setFilters({ page: 1, limit: 20, search: '', status: undefined, type: undefined, date_from: undefined, date_to: undefined })}
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
