'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useCampaignDetail } from '@/hooks/use-campaign-detail'
import { CampaignDetailHeader } from '@/components/campaigns/campaign-detail-header'
import { CampaignFunnelStats } from '@/components/campaigns/campaign-funnel-stats'
import { CampaignProgress } from '@/components/campaigns/campaign-progress'
import { CampaignRecipientsTable } from '@/components/campaigns/campaign-recipients-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { data: campaign, isLoading } = useCampaignDetail(params.id)

  if (isLoading) {
    return (
      <PageContainer>
        <Breadcrumbs />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (!campaign) return <div>Campaign not found</div>

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="mt-8">
        <CampaignDetailHeader campaign={campaign} />
        
        <CampaignFunnelStats stats={campaign.stats} />

        {campaign.status === 'sending' && (
          <CampaignProgress 
            sent={campaign.stats?.sent || 0} 
            total={campaign.stats?.recipients || 0} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignRecipientsTable campaignId={campaign.id} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Message Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm font-mono">
                  {campaign.message_template}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audience Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(campaign.audience_filter, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
