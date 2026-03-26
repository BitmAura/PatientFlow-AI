import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  AlertTriangle,
  LucideIcon
} from 'lucide-react'

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Pending',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.CHECKED_IN]: 'Checked In',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No-Show',
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [AppointmentStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AppointmentStatus.CHECKED_IN]: 'bg-purple-100 text-purple-800 border-purple-200',
  [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [AppointmentStatus.NO_SHOW]: 'bg-gray-100 text-gray-800 border-gray-200',
}

export const APPOINTMENT_STATUS_ICONS: Record<AppointmentStatus, LucideIcon> = {
  [AppointmentStatus.PENDING]: Clock,
  [AppointmentStatus.CONFIRMED]: CheckCircle,
  [AppointmentStatus.CHECKED_IN]: Calendar,
  [AppointmentStatus.COMPLETED]: CheckCircle,
  [AppointmentStatus.CANCELLED]: XCircle,
  [AppointmentStatus.NO_SHOW]: AlertCircle,
}

export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW, // In case they just don't show up without confirmation
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED, // Edge case
    AppointmentStatus.NO_SHOW, // Edge case
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
}
