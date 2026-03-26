'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface CampaignReviewProps {
  data: any
  isSubmitting: boolean
  onSubmit: () => void
}

export function CampaignReview({ data, isSubmitting, onSubmit }: CampaignReviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Campaign Name</p>
              <p className="text-lg">{data.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-lg capitalize">{data.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Schedule</p>
              <p className="text-lg">
                {data.send_immediately ? 'Immediately' : format(new Date(data.scheduled_at), 'PPP p')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Message Preview</p>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm font-mono">
              {data.message}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Launch Campaign
        </Button>
      </div>
    </div>
  )
}
