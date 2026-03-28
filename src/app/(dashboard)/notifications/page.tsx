'use client'

import * as React from 'react'
import { NotificationList } from '@/components/notifications/notification-list'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'

export default function NotificationsPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Notifications"
        description="Stay updated on appointments and clinic activity."
      />

      <PageCard variant="minimal" className="max-w-3xl border-0 p-0 shadow-none">
        <NotificationList />
      </PageCard>
    </PageContainer>
  )
}
