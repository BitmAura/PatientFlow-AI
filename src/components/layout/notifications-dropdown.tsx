import * as React from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/use-notifications'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationItem } from '@/components/notifications/notification-item'
import Link from 'next/link'

export function NotificationsDropdown() {
  const [open, setOpen] = React.useState(false)
  const { data: notifications } = useNotifications(10)
  const { data: unreadCount } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const list = notifications?.notifications || []
  const hasUnread = (unreadCount || 0) > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {hasUnread && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">We&apos;ll notify you when something important happens.</p>
            </div>
          ) : (
            <div>
              {list.map((notification: any) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onClick={() => {
                    if (!notification.read) markAsRead.mutate(notification.id)
                  }}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t bg-gray-50/50">
          <Button variant="ghost" className="w-full text-xs" asChild>
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
