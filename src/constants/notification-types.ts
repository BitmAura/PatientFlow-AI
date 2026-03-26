import { Calendar, Check, X, Clock, DollarSign, UserX, Send, WifiOff, AlertTriangle } from 'lucide-react'

export const NOTIFICATION_TYPES: Record<string, any> = {
  new_booking: {
    icon: Calendar,
    color: 'text-blue-600 bg-blue-100',
    title: 'New Booking',
    template: '{{patient_name}} booked {{service}} for {{date}}'
  },
  appointment_confirmed: {
    icon: Check,
    color: 'text-green-600 bg-green-100',
    title: 'Appointment Confirmed',
    template: '{{patient_name}} confirmed appointment on {{date}}'
  },
  appointment_cancelled: {
    icon: X,
    color: 'text-red-600 bg-red-100',
    title: 'Appointment Cancelled',
    template: '{{patient_name}} cancelled appointment on {{date}}'
  },
  reschedule_request: {
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
    title: 'Reschedule Request',
    template: '{{patient_name}} requested to reschedule {{date}}'
  },
  deposit_received: {
    icon: DollarSign,
    color: 'text-green-600 bg-green-100',
    title: 'Deposit Received',
    template: 'Received ₹{{amount}} deposit from {{patient_name}}'
  },
  no_show: {
    icon: UserX,
    color: 'text-red-600 bg-red-100',
    title: 'No-Show Recorded',
    template: '{{patient_name}} marked as no-show for {{date}}'
  },
  campaign_completed: {
    icon: Send,
    color: 'text-purple-600 bg-purple-100',
    title: 'Campaign Completed',
    template: 'Campaign "{{campaign_name}}" finished sending to {{count}} recipients'
  },
  whatsapp_disconnected: {
    icon: WifiOff,
    color: 'text-gray-600 bg-gray-100',
    title: 'WhatsApp Disconnected',
    template: 'WhatsApp session expired. Please reconnect.'
  },
  usage_warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-100',
    title: 'Plan Usage Warning',
    template: 'You have used {{usage}} of {{limit}} appointments this month.'
  }
}
