import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateCampaignInput, AudienceFilters } from '@/lib/validations/campaign'

export function useCampaigns(filters?: { status?: string, page?: number }) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.page) params.append('page', filters.page.toString())
      
      const res = await fetch(`/api/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      return res.json()
    }
  })
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const res = await fetch('/api/campaigns/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    }
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create campaign')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    }
  })
}

export function usePreviewAudience() {
  return useMutation({
    mutationFn: async ({ type, filters }: { type: string, filters: AudienceFilters }) => {
      const res = await fetch('/api/campaigns/audience-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_type: type, filters })
      })
      if (!res.ok) throw new Error('Failed to preview audience')
      return res.json()
    }
  })
}
