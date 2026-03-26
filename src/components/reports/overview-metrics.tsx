import { MetricCard } from './metric-card'
import { Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'

interface OverviewMetricsProps {
  data: any
  isLoading: boolean
}

export function OverviewMetrics({ data, isLoading }: OverviewMetricsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <MetricCard key={i} title="Loading" value={0} loading />)}
      </div>
    )
  }

  // Calculate changes
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const prev = data.comparison || {}
  
  const apptChange = calculateChange(data.total_appointments, prev.total_appointments)
  const completedChange = calculateChange(data.completed, prev.completed)
  const noShowChange = calculateChange(data.no_show_rate, prev.no_show_rate) // Compare rate diff
  const revenueChange = calculateChange(data.deposits_collected, prev.deposits_collected)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Appointments"
        value={data.total_appointments}
        change={apptChange}
        changeType="positive"
        icon={Calendar}
      />
      <MetricCard
        title="Completed"
        value={`${data.completed} (${data.completion_rate}%)`}
        change={completedChange}
        changeType="positive"
        icon={CheckCircle}
      />
      <MetricCard
        title="No-Show Rate"
        value={`${data.no_show_rate}%`}
        change={data.no_show_rate - prev.no_show_rate} // Absolute % diff often better for rates
        changeType="negative"
        icon={XCircle}
        description={`${data.no_shows} missed appointments`}
      />
      <MetricCard
        title="Deposits Collected"
        value={formatCurrency(data.deposits_collected)}
        change={revenueChange}
        changeType="positive"
        icon={DollarSign}
      />
    </div>
  )
}
