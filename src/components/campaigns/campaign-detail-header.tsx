'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Loader2, Play, Ban, Trash2, Edit2, Copy } from 'lucide-react'
import { useSendCampaign, useCancelCampaign, useDeleteCampaign } from '@/hooks/use-campaign-detail'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface CampaignDetailHeaderProps {
  campaign: any
}

export function CampaignDetailHeader({ campaign }: CampaignDetailHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const send = useSendCampaign()
  const cancel = useCancelCampaign()
  const deleteCampaign = useDeleteCampaign()

  const handleSend = async () => {
    try {
      await send.mutateAsync(campaign.id)
      toast({ title: 'Campaign Started', description: 'Messages are being queued.' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start campaign.' })
    }
  }

  const handleCancel = async () => {
    if (!confirm('Stop sending remaining messages?')) return
    await cancel.mutateAsync(campaign.id)
    toast({ title: 'Campaign Cancelled' })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return
    await deleteCampaign.mutateAsync(campaign.id)
    router.push('/campaigns')
    toast({ title: 'Campaign Deleted' })
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <Badge variant="outline" className="capitalize">{campaign.type.replace('_', ' ')}</Badge>
          <Badge 
            className={
              campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
              campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'
            }
          >
            {campaign.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Created {format(new Date(campaign.created_at), 'PPP')} • 
          {campaign.status === 'scheduled' && ` Scheduled for ${format(new Date(campaign.scheduled_at), 'PPP p')}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {campaign.status === 'draft' && (
          <>
            <Button variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button size="sm" onClick={handleSend} disabled={send.isPending}>
              {send.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Send Now
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {campaign.status === 'sending' && (
          <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancel.isPending}>
            <Ban className="mr-2 h-4 w-4" /> Stop Sending
          </Button>
        )}

        {campaign.status === 'completed' && (
          <>
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
