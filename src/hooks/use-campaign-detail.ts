import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`)
      if (!res.ok) throw new Error('Failed to fetch campaign')
      return res.json()
    },
    refetchInterval: (query) => {
      // Poll faster if sending
      return query.state.data?.status === 'sending' ? 5000 : false
    }
  })
}

export function useCampaignRecipients(id: string, filters?: any) {
  return useQuery({
    queryKey: ['campaign-recipients', id, filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/campaigns/${id}/recipients?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch recipients')
      return res.json()
    },
    placeholderData: (prev) => prev // Keep previous data while fetching new
  })
}

export function useSendCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start campaign')
      return res.json()
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    }
  })
}

export function useCancelCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}/cancel`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to cancel campaign')
      return res.json()
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    }
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })
}
