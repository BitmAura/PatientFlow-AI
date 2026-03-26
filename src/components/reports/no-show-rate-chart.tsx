'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface NoShowRateChartProps {
  data: { date: string, rate: number }[]
  isLoading?: boolean
}

export function NoShowRateChart({ data, isLoading }: NoShowRateChartProps) {
  if (isLoading) return <div className="h-[350px] bg-gray-100 animate-pulse rounded-lg" />

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>No-Show Rate Over Time</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => format(new Date(val), 'MMM d')}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                unit="%" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}%`, 'No-Show Rate']}
                labelFormatter={(label) => format(new Date(label), 'PPP')}
              />
              <ReferenceLine y={10} stroke="red" strokeDasharray="3 3" label="Target (10%)" />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
