import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityItem } from './activity-item'
import { useActivityFeed } from '@/hooks/use-notifications'
import { Loader2, ArrowRight, Activity } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import Link from 'next/link'

export function ActivityFeed() {
  const { data: activities, isLoading } = useActivityFeed(10)

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/reports/audit-log">View all <ArrowRight className="ml-1 w-3 h-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : activities?.length === 0 ? (
          <EmptyState 
            icon={Activity}
            title="No recent activity"
            description="Actions performed by you and your team will appear here."
            className="border-none py-8"
          />
        ) : (
          <div className="divide-y">
            {activities?.map((activity: any) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
