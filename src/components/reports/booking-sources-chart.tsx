'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BookingSourcesChartProps {
  data: { dashboard: number, booking_page: number, walk_in: number, phone: number }
  isLoading?: boolean
}

export function BookingSourcesChart({ data, isLoading }: BookingSourcesChartProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  const chartData = [
    { name: 'Dashboard (Staff)', value: data.dashboard, color: '#3b82f6' },
    { name: 'Online Booking', value: data.booking_page, color: '#8b5cf6' },
    { name: 'Walk-in', value: data.walk_in, color: '#f59e0b' },
    { name: 'Phone', value: data.phone, color: '#10b981' },
  ].filter(d => d.value > 0)

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Booking Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
