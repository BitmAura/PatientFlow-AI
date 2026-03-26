"use client"

import { useState } from "react"
import { useWaitingList, useWaitlistStats } from "@/hooks/use-waiting-list"
import { WaitlistTable } from "@/components/waiting-list/waitlist-table"
import { AddToWaitlistDialog } from "@/components/waiting-list/add-to-waitlist-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users, Bell, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WaitlistStatus } from "@/types/waiting-list"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export default function WaitingListPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<WaitlistStatus | "all">("all")
  
  const { data: stats, isLoading: statsLoading } = useWaitlistStats()
  const { data: waitlist, isLoading: listLoading } = useWaitingList({
    status: statusFilter === "all" ? undefined : statusFilter
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Waiting List</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add to Waitlist
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
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
        </Card>
        <Card>
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
        </Card>
        <Card>
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
        </Card>
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
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <WaitlistTable data={waitlist || []} />
      )}

      <AddToWaitlistDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  )
}
