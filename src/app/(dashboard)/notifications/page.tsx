'use client'

import * as React from 'react'
import { NotificationList } from '@/components/notifications/notification-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on appointments and clinic activity.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <NotificationList />
      </div>
    </div>
  )
}
