import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Lead } from '@/types/leads'

interface LeadsFilters {
  search?: string
  status?: string
  source?: string
  page?: number
  limit?: number
}

interface LeadsResponse {
  data: Lead[]
  count: number
  page: number
  limit: number
}

export function useLeads(filters: LeadsFilters) {
  return useQuery<LeadsResponse>({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.source) params.append('source', filters.source)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/leads?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch leads')
      return response.json()
    },
  })
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`)
      if (!response.ok) throw new Error('Failed to fetch lead')
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to create lead')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Lead> }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update lead')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete lead')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
