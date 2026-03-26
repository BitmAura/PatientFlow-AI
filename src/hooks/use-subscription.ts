import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription')
      if (!res.ok) throw new Error('Failed to fetch subscription')
      return res.json()
    }
  })
}

export function useUpgradePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ planId, paymentMethodId }: { planId: string, paymentMethodId?: string }) => {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, payment_method_id: paymentMethodId })
      })
      if (!res.ok) throw new Error('Failed to upgrade plan')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    }
  })
}

export function useDowngradePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const res = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId })
      })
      if (!res.ok) throw new Error('Failed to downgrade plan')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    }
  })
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ['billing-history'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/billing-history')
      if (!res.ok) throw new Error('Failed to fetch billing history')
      return res.json()
    }
  })
}
