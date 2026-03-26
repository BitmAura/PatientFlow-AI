'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface NoShowByDayChartProps {
  data: { day: string, rate: number }[]
  isLoading?: boolean
}

export function NoShowByDayChart({ data, isLoading }: NoShowByDayChartProps) {
  if (isLoading) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />

  const maxRate = Math.max(...(data?.map(d => d.rate) || [0]))
  const worstDay = data?.find(d => d.rate === maxRate)?.day || '-'

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>No-Shows by Day</CardTitle>
        <CardDescription>
          Highest rate on <span className="font-semibold text-red-600">{worstDay}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis unit="%" fontSize={12} tickLine={false} axisLine={false} hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                formatter={(value: any) => [`${value}%`, 'No-Show Rate']}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rate === maxRate ? '#ef4444' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
