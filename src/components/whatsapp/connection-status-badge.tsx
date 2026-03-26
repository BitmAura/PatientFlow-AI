'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { WhatsAppSession } from '@/lib/whatsapp/types'
import { CONNECTION_STATUS } from '@/constants/whatsapp'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ConnectionStatusBadgeProps {
  status?: WhatsAppSession['status']
  phone?: string
  className?: string
}

export function ConnectionStatusBadge({ status, phone, className }: ConnectionStatusBadgeProps) {
  const getColor = () => {
    switch (status) {
      case CONNECTION_STATUS.CONNECTED: return 'bg-green-500'
      case CONNECTION_STATUS.CONNECTING: return 'bg-yellow-500'
      case CONNECTION_STATUS.DISCONNECTED: return 'bg-red-500'
      case CONNECTION_STATUS.EXPIRED: return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getLabel = () => {
    switch (status) {
      case CONNECTION_STATUS.CONNECTED: return 'WhatsApp Connected'
      case CONNECTION_STATUS.CONNECTING: return 'Connecting WhatsApp...'
      case CONNECTION_STATUS.DISCONNECTED: return 'WhatsApp Disconnected'
      case CONNECTION_STATUS.EXPIRED: return 'Connection Expired'
      default: return 'Offline'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50 cursor-help", className)}>
            <div className={cn("h-2 w-2 rounded-full animate-pulse", getColor())} />
            <span className="text-xs font-medium hidden sm:inline-block">
              {status === CONNECTION_STATUS.CONNECTED ? 'Connected' : 'WhatsApp'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getLabel()}</p>
          {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
