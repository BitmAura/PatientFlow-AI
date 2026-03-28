
'use client';

import { JourneyBoard } from '@/components/journeys/journey-board';
import { PageContainer } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure';

export default function JourneysPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Journeys"
        description="Design and manage patient communication journeys."
      />
      <PageCard variant="minimal" className="border-0 p-0 shadow-none">
        <JourneyBoard />
      </PageCard>
    </PageContainer>
  );
}
