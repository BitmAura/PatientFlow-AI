'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format-currency'

interface DepositsChartProps {
  data: { date: string, amount: number }[]
  isLoading?: boolean
}

export function DepositsChart({ data, isLoading }: DepositsChartProps) {
  if (isLoading) return <div className="h-[350px] bg-gray-100 animate-pulse rounded-lg" />

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue from Deposits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => format(new Date(val), 'MMM d')}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'Collected']}
                labelFormatter={(label) => format(new Date(label), 'PPP')}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#16a34a" 
                fill="#16a34a" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
