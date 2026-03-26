'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface CampaignScheduleProps {
  scheduledAt: string | undefined
  sendImmediately: boolean
  onScheduleChange: (date: string | undefined) => void
  onImmediateChange: (val: boolean) => void
}

export function CampaignSchedule({ 
  scheduledAt, 
  sendImmediately, 
  onScheduleChange, 
  onImmediateChange 
}: CampaignScheduleProps) {
  
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <RadioGroup 
          value={sendImmediately ? 'now' : 'later'} 
          onValueChange={(val) => onImmediateChange(val === 'now')}
        >
          <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="now" id="now" />
            <Label htmlFor="now" className="cursor-pointer flex-1">
              <span className="font-semibold block">Send Immediately</span>
              <span className="text-sm text-muted-foreground">Start sending as soon as campaign is created</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="later" id="later" />
            <Label htmlFor="later" className="cursor-pointer flex-1">
              <span className="font-semibold block">Schedule for Later</span>
              <span className="text-sm text-muted-foreground">Pick a specific date and time</span>
            </Label>
          </div>
        </RadioGroup>

        {!sendImmediately && (
          <div className="pl-6 pt-2">
            <Label>Date & Time</Label>
            <Input 
              type="datetime-local" 
              className="mt-2 max-w-sm"
              value={scheduledAt || ''}
              onChange={(e) => onScheduleChange(e.target.value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
