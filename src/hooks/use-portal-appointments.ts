import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePatientAppointments() {
  return useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const res = await fetch('/api/portal/appointments')
      if (res.status === 401) {
        window.location.href = '/portal/login'
        throw new Error('Unauthorized')
      }
      if (!res.ok) throw new Error('Failed to fetch appointments')
      return res.json()
    }
  })
}

export function useRequestReschedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`/api/portal/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to submit request')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
    }
  })
}

export function useRequestCancel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const res = await fetch(`/api/portal/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) throw new Error('Failed to submit request')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] })
    }
  })
}
