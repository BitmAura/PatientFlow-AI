'use client'

import React from 'react'
import { useStats } from '@/hooks/use-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, Phone, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function MoneyLeakList() {
  const { data: stats, isLoading } = useStats()

  if (isLoading) return null
  if (!stats?.money_leak_list?.length) return null

  return (
    <Card className="border-red-100 bg-red-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Money Leak: Overdue Recalls
          </CardTitle>
          <Badge variant="destructive" className="bg-red-600">
            High Priority
          </Badge>
        </div>
        <p className="text-xs text-red-700">
          Patients who completed treatment but haven&apos;t booked their follow-up/cleaning.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.money_leak_list.map((patient: any) => (
            <div key={patient.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-3 shadow-sm">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{patient.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  Last visit: {formatDistanceToNow(new Date(patient.last_visit))} ago
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${patient.phone}`} title={`Call ${patient.full_name}`} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">
                  <Phone className="h-4 w-4" />
                </a>
                <Badge variant="outline" className="border-red-200 text-red-700">
                  Recall Due
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
