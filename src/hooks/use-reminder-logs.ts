import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ReminderLog {
  id: string
  patient_id?: string | null
  created_at: string
  type: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  message: string
  content?: string
  error?: string | null
  error_reason?: string | null
  response?: string | null
  metadata?: Record<string, unknown> | null
  patients?: {
    full_name: string | null
    phone: string | null
  } | null
}

export interface ReminderStats {
  sent_today: number
  delivery_rate: number
  read_rate: number
  response_rate: number
  trends: {
    sent: number
    delivery: number
    read: number
    response: number
  }
}

interface LogFilters {
  page?: number
  limit?: number
  date_from?: string
  date_to?: string
  types?: string[]
  statuses?: string[]
  search?: string
}

export function useReminderLogs(filters: LogFilters) {
  return useQuery({
    queryKey: ['reminder-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      if (filters.types?.length) params.append('types', filters.types.join(','))
      if (filters.statuses?.length) params.append('statuses', filters.statuses.join(','))
      if (filters.search) params.append('search', filters.search)

      const res = await fetch(`/api/reminders/logs?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch logs')
      return res.json() as Promise<{ data: ReminderLog[], meta: any }>
    },
  })
}

export function useReminderStats() {
  return useQuery({
    queryKey: ['reminder-stats'],
    queryFn: async () => {
      const res = await fetch('/api/reminders/logs/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json() as Promise<ReminderStats>
    },
  })
}

export function useResendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reminders/${id}/resend`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to resend message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-logs'] })
    },
  })
}
