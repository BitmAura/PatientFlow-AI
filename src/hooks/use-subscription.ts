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
    mutationFn: async ({ planId, paymentMethodId, billing_cycle = 'monthly' }: { planId: string, paymentMethodId?: string, billing_cycle?: 'monthly' | 'annual' }) => {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, payment_method_id: paymentMethodId, billing_cycle })
      })
      if (!res.ok) {
        let errorMsg = 'Failed to upgrade plan'
        try {
          const payload = await res.json()
          errorMsg = payload?.error || errorMsg
        } catch (e) {
          errorMsg = res.statusText || errorMsg
        }
        throw new Error(errorMsg)
      }
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
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error || 'Failed to downgrade plan')
      }
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
