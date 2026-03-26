import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateFollowupInput } from '@/lib/validations/followup'

export function useFollowups(filters?: { status?: string, due?: string, type?: string, page?: number }) {
  return useQuery({
    queryKey: ['followups', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.due) params.append('due', filters.due)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.page) params.append('page', filters.page.toString())
      
      const res = await fetch(`/api/followups?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch followups')
      return res.json()
    }
  })
}

export function useFollowupStats() {
  return useQuery({
    queryKey: ['followup-stats'],
    queryFn: async () => {
      const res = await fetch('/api/followups/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    }
  })
}

export function useCreateFollowup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateFollowupInput) => {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create followup')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['followup-stats'] })
    }
  })
}

export function useSendFollowup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/followups/${id}/send`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to send followup')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['followup-stats'] })
    }
  })
}

export function useConvertFollowup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`/api/followups/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to convert followup')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['followup-stats'] })
    }
  })
}
