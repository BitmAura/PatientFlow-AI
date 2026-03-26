import * as React from 'react'
import { Check, CheckCheck, X, Clock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

interface MessageStatusIconProps {
  status: string
  className?: string
}

export function MessageStatusIcon({ status, className }: MessageStatusIconProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'read':
        return { icon: CheckCheck, color: 'text-blue-500', label: 'Read by patient' }
      case 'delivered':
        return { icon: CheckCheck, color: 'text-gray-400', label: 'Delivered to device' }
      case 'sent':
        return { icon: Check, color: 'text-gray-400', label: 'Sent to WhatsApp' }
      case 'failed':
        return { icon: X, color: 'text-red-500', label: 'Failed to send' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', label: 'Queued' }
      default:
        return { icon: Clock, color: 'text-gray-300', label: 'Unknown status' }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className={cn("h-4 w-4", config.color, className)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
