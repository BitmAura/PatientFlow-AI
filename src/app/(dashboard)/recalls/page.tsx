
'use client';

import { RecallBoard } from '@/components/recalls/recall-board';
import { PageContainer } from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure';

export default function RecallsPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Recalls"
        description="Track and automate recall workflows for inactive patients."
      />
      <PageCard variant="minimal" className="border-0 p-0 shadow-none">
        <RecallBoard />
      </PageCard>
    </PageContainer>
  );
}
