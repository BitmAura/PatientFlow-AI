import { formatDistanceToNow } from 'date-fns'
import { Activity, User, Calendar, MessageSquare, DollarSign, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ActivityItemProps {
  activity: any
}

const ACTIVITY_ICONS: Record<string, any> = {
  appointment: Calendar,
  patient: User,
  campaign: MessageSquare,
  reminder: MessageSquare,
  payment: DollarSign,
  settings: Settings,
  default: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = ACTIVITY_ICONS[activity.entity_type] || ACTIVITY_ICONS.default
  
  // Format description
  // In a real app, this would be more sophisticated based on action type
  // e.g. "created", "updated", "cancelled"
  const description = `${activity.users?.full_name || 'System'} ${activity.action} ${activity.entity_type}`

  return (
    <div className="flex gap-4 items-start py-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </span>
          {activity.metadata?.details && (
             <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-muted-foreground truncate">
                {activity.metadata.details}
              </span>
             </>
          )}
        </div>
      </div>
    </div>
  )
}
