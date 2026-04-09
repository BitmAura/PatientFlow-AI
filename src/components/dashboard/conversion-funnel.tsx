'use client'

import { useMemo } from 'react'
import { useStats } from '@/hooks/use-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function ConversionFunnel() {
  const { data: stats } = useStats()

  const funnel = useMemo(
    () => [
      { stage: 'New', value: stats?.lead_pipeline_stats?.new ?? 0 },
      { stage: 'Contacted', value: stats?.lead_pipeline_stats?.contacted ?? 0 },
      { stage: 'Responsive', value: stats?.lead_pipeline_stats?.responsive ?? 0 },
      { stage: 'Booked', value: stats?.lead_pipeline_stats?.booked ?? 0 },
    ],
    [stats]
  )

  if (!stats) return null

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">
            {stats.uncontacted_leads_count} leads not followed up
          </p>
          <p className="rounded-md border border-red-200 bg-red-50 p-2 text-red-800">
            {stats.no_shows_this_week} no-shows this week
          </p>
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">
            Revenue recovered: Rs {stats.estimated_revenue_recovered.toLocaleString('en-IN')}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Weekly Bookings and Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.weekly_bookings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="booked" stroke="#2563eb" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}
