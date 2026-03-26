'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NoShowByServiceChartProps {
  data: { service: string, rate: number }[]
  isLoading?: boolean
}

export function NoShowByServiceChart({ data, isLoading }: NoShowByServiceChartProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  // Take top 5
  const chartData = data?.slice(0, 5) || []

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>By Service</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" unit="%" hide />
              <YAxis 
                dataKey="service" 
                type="category" 
                width={100}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value: any) => [`${value}%`, 'No-Show Rate']} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
