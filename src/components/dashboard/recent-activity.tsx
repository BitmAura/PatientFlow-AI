'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CreditCard, Calendar, UserX } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'

// Mock data - replace with real API call later
const ACTIVITIES = [
  {
    id: '1',
    type: 'booking',
    title: 'New appointment booked',
    description: 'Sarah Johnson for Dental Cleaning',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    icon: Calendar,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Deposit received',
    description: '₹500 from Michael Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    icon: CreditCard,
    color: 'text-green-500 bg-green-50',
  },
  {
    id: '3',
    type: 'cancellation',
    title: 'Appointment cancelled',
    description: 'Emma Davis requested cancellation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    icon: UserX,
    color: 'text-red-500 bg-red-50',
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0">
              <div className={`mt-0.5 rounded-full p-1.5 ${activity.color}`}>
                <activity.icon className="h-3 w-3" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
