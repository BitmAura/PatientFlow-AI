import * as React from 'react'
import { NOTIFICATION_TYPES } from '@/constants/notification-types'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'

interface NotificationItemProps {
  notification: any
  onClick?: () => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const typeConfig = NOTIFICATION_TYPES[notification.type] || {
    icon: Bell,
    color: 'bg-gray-100 text-gray-600',
    title: 'Notification'
  }
  
  const Icon = typeConfig.icon

  return (
    <div 
      className={cn(
        "flex gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors relative",
        !notification.read && "bg-blue-50/50"
      )}
      onClick={onClick}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", typeConfig.color)}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-medium text-gray-900 truncate pr-2">
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
      )}
    </div>
  )
}
