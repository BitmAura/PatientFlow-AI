import { Badge } from '@/components/ui/badge'
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_ICONS } from '@/constants/appointment-status'
import { cn } from '@/lib/utils/cn'

interface StatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  // Cast to enum to access maps safely, defaulting to PENDING if unknown
  const statusKey = Object.values(AppointmentStatus).includes(status as AppointmentStatus)
    ? (status as AppointmentStatus)
    : AppointmentStatus.PENDING

  const colorClass = APPOINTMENT_STATUS_COLORS[statusKey]
  const label = APPOINTMENT_STATUS_LABELS[statusKey]
  const Icon = APPOINTMENT_STATUS_ICONS[statusKey]

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium gap-1.5", colorClass, className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  )
}
