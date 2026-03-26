'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AppointmentsByStatusChartProps {
  data: { completed: number, no_shows: number, cancelled: number }
  isLoading?: boolean
}

export function AppointmentsByStatusChart({ data, isLoading }: AppointmentsByStatusChartProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  const chartData = [
    { name: 'Completed', value: data.completed, color: '#16a34a' },
    { name: 'No-Shows', value: data.no_shows, color: '#ef4444' },
    { name: 'Cancelled', value: data.cancelled, color: '#94a3b8' },
  ].filter(d => d.value > 0)

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
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
