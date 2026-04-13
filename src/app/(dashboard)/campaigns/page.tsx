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
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'

export default function CampaignsPage() {
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { data: stats } = useCampaignStats()

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Campaigns"
        description="Engage your patients with bulk messaging campaigns."
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        }
      />

      <CampaignStatsCards stats={stats} />
      
      <PageCard variant="default" padding>
        <h2 className="text-lg font-semibold mb-4">All Campaigns</h2>
        <CampaignTable 
          data={campaigns?.campaigns || []}
          isLoading={campaignsLoading} 
        />
      </PageCard>
    </PageContainer>
  )
}
