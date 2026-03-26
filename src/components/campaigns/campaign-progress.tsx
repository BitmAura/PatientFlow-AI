'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface CampaignProgressProps {
  sent: number
  total: number
}

export function CampaignProgress({ sent, total }: CampaignProgressProps) {
  const percentage = total > 0 ? Math.round((sent / total) * 100) : 0
  const remaining = total - sent
  
  // Estimate: 2 seconds per message (batch rate limit)
  const secondsLeft = remaining * 2
  const timeLeft = secondsLeft > 60 
    ? `~${Math.ceil(secondsLeft / 60)} minutes remaining`
    : `~${secondsLeft} seconds remaining`

  return (
    <Card className="bg-blue-50/50 border-blue-100 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <h3 className="font-semibold text-blue-900">Sending Campaign...</h3>
          </div>
          <span className="text-sm font-medium text-blue-700">{percentage}% Complete</span>
        </div>
        
        <Progress value={percentage} className="h-2 mb-2" />
        
        <div className="flex justify-between text-xs text-blue-600">
          <span>{sent} of {total} messages sent</span>
          <span>{timeLeft}</span>
        </div>
      </CardContent>
    </Card>
  )
}
