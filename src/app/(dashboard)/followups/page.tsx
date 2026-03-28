'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { FollowupStatsCards } from '@/components/followups/followup-stats-cards'
import { FollowupTable } from '@/components/followups/followup-table'
import { ScheduleFollowupDialog } from '@/components/followups/schedule-followup-dialog'
import { useFollowups, useFollowupStats } from '@/hooks/use-followups'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'

export default function FollowupsPage() {
  const [activeTab, setActiveTab] = React.useState('due_today')
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false)
  
  const { data: stats } = useFollowupStats()
  
  // Fetch data based on active tab
  const filterDue = activeTab === 'all' || activeTab === 'pending' ? undefined : 
                    activeTab === 'due_today' ? 'today' : 
                    activeTab === 'upcoming' ? 'upcoming' : 
                    activeTab === 'overdue' ? 'overdue' : undefined
  
  const filterStatus = activeTab === 'completed' ? 'completed' : 
                       activeTab === 'pending' ? 'pending' : undefined

  const filterType = activeTab === 'pending' ? 'pending_booking' : undefined

  const { data: followups, isLoading } = useFollowups({ 
    due: filterDue,
    status: filterStatus,
    type: filterType
  })

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Follow-ups"
        description="Manage post-appointment checkups and reminders."
        actions={
          <Button onClick={() => setIsScheduleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Follow-up
          </Button>
        }
      />

      <FollowupStatsCards stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="font-semibold">Pending List</TabsTrigger>
          <TabsTrigger value="due_today">Due Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue" className="text-red-600 data-[state=active]:text-red-700">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <PageCard variant="default" padding>
            <FollowupTable 
              data={followups?.data || []} 
              isLoading={isLoading} 
            />
          </PageCard>
        </TabsContent>
      </Tabs>

      <ScheduleFollowupDialog 
        open={isScheduleOpen} 
        onOpenChange={setIsScheduleOpen} 
      />
    </PageContainer>
  )
}
