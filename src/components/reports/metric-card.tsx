import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ElementType
  description?: string
  loading?: boolean
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  description,
  loading 
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const isPositive = change && change > 0
  const isNegative = change && change < 0
  
  // Color logic:
  // If changeType is 'positive' (e.g. Revenue), green is good (up).
  // If changeType is 'negative' (e.g. No-shows), red is bad (up), green is good (down).
  
  let changeColor = 'text-gray-500'
  if (changeType === 'positive') {
    changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  } else if (changeType === 'negative') {
    changeColor = isPositive ? 'text-red-600' : 'text-green-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined && change !== null) && (
          <p className={cn("text-xs flex items-center mt-1", changeColor)}>
            {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}%
            <span className="text-muted-foreground ml-1">vs last period</span>
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
