'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CampaignStatsCards } from '@/components/campaigns/campaign-stats-cards'
import { CampaignTable } from '@/components/campaigns/campaign-table'
import { useCampaigns, useCampaignStats } from '@/hooks/use-campaigns'
import Link from 'next/link'

export default function CampaignsPage() {
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { data: stats } = useCampaignStats()

  return (
    <PageContainer>
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Engage your patients with bulk messaging campaigns.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <CampaignStatsCards stats={stats} />
      
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">All Campaigns</h2>
        <CampaignTable 
          data={campaigns?.data || []} 
          isLoading={campaignsLoading} 
        />
      </div>
    </PageContainer>
  )
}
