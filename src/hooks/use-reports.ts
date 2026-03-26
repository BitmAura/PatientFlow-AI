import { useQuery } from '@tanstack/react-query'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

function formatDateRange(range: DateRange | undefined) {
  if (!range?.from || !range?.to) return ''
  return `?from=${format(range.from, 'yyyy-MM-dd')}&to=${format(range.to, 'yyyy-MM-dd')}`
}

export function useReportOverview(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['report-overview', dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/overview${formatDateRange(dateRange)}`)
      if (!res.ok) throw new Error('Failed to fetch overview')
      return res.json()
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  })
}

export function useNoShowReport(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['report-noshow', dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/no-shows${formatDateRange(dateRange)}`)
      if (!res.ok) throw new Error('Failed to fetch no-show report')
      return res.json()
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  })
}

export function useAppointmentReport(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['report-appointments', dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/appointments${formatDateRange(dateRange)}`)
      if (!res.ok) throw new Error('Failed to fetch appointment report')
      return res.json()
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  })
}

export function useRevenueReport(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ['report-revenue', dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/revenue${formatDateRange(dateRange)}`)
      if (!res.ok) throw new Error('Failed to fetch revenue report')
      return res.json()
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  })
}
