"use client"

import { useState } from "react"
import { useWaitingList, useWaitlistStats } from "@/hooks/use-waiting-list"
import { WaitlistTable } from "@/components/waiting-list/waitlist-table"
import { AddToWaitlistDialog } from "@/components/waiting-list/add-to-waitlist-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users, Bell, CheckCircle } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WaitlistStatus } from "@/types/waiting-list"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader, PageCard, EmptyState, SkeletonLoader } from '@/components/dashboard/PageStructure'

export default function WaitingListPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<WaitlistStatus | "all">("all")
  
  const { data: stats, isLoading: statsLoading } = useWaitlistStats()
  const { data: waitlist, isLoading: listLoading } = useWaitingList({
    status: statusFilter === "all" ? undefined : statusFilter
  })

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Waiting List"
        description="Track and convert patients waiting for available slots."
        actions={
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add to Waitlist
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <PageCard variant="default" padding>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Waiting
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.waiting}
            </div>
          </CardContent>
        </PageCard>
        <PageCard variant="default" padding>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notified
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.notified}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting for response
            </p>
          </CardContent>
        </PageCard>
        <PageCard variant="default" padding>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Converted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.converted}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </PageCard>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Select 
            value={statusFilter} 
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="notified">Notified</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {listLoading ? (
        <SkeletonLoader variant="table" rows={3} />
      ) : (waitlist || []).length === 0 ? (
        <EmptyState
          title="No waiting list records"
          description="Start by adding patients who are waiting for appointment slots."
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add to Waitlist
            </Button>
          }
        />
      ) : (
        <WaitlistTable data={waitlist || []} />
      )}

      <AddToWaitlistDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </PageContainer>
  )
}
