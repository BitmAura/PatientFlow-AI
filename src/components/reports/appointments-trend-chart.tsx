'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface AppointmentsTrendChartProps {
  data: any[]
  isLoading?: boolean
}

export function AppointmentsTrendChart({ data, isLoading }: AppointmentsTrendChartProps) {
  if (isLoading) return <div className="h-[350px] bg-gray-100 animate-pulse rounded-lg" />

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointment Volume & Status</CardTitle>
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
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={(label) => format(new Date(label), 'PPP')} />
              <Legend />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#16a34a" fill="#16a34a" name="Completed" />
              <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#94a3b8" fill="#94a3b8" name="Cancelled" />
              <Area type="monotone" dataKey="no_shows" stackId="1" stroke="#ef4444" fill="#ef4444" name="No-Show" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
