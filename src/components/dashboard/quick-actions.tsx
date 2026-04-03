'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bell, Clock, Users } from 'lucide-react'
import { useStats } from '@/hooks/use-stats'
import { Skeleton } from '@/components/ui/skeleton'

export function QuickActions() {
  const { data: stats, isLoading } = useStats()

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Insights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Pending Confirmations */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats?.pending_confirmations_count || 0} Pending</p>
              <p className="text-xs text-muted-foreground">Waiting for confirmation</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-orange-600">
            Remind All
          </Button>
        </div>

        {/* Follow-ups Due */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats?.followups_due_count || 0} Follow-ups</p>
              <p className="text-xs text-muted-foreground">Due for today</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            View
          </Button>
        </div>

        {/* Waiting List */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{stats?.waiting_list_count || 0} Waiting</p>
              <p className="text-xs text-muted-foreground">Patients in queue</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
