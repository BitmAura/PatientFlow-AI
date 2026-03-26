import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationItem } from './notification-item'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications'
import { Loader2, CheckCheck } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Bell } from 'lucide-react'

export function NotificationList() {
  const { data, isLoading } = useNotifications(50)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const notifications = data?.notifications || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl">All Notifications</CardTitle>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <EmptyState 
            icon={Bell}
            title="No notifications"
            description="You're all caught up! Check back later for updates."
            className="border-none py-16"
          />
        ) : (
          <div className="divide-y">
            {notifications.map((notification: any) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onClick={() => !notification.read && markAsRead.mutate(notification.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
