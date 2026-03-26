import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppointmentStatus } from '@/constants/appointment-status'

export function useAppointments(filters: any = {}) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.date_from) params.append('date_from', filters.date_from.toISOString())
      if (filters.date_to) params.append('date_to', filters.date_to.toISOString())
      if (filters.search) params.append('search', filters.search)
      if (filters.service_id?.length) filters.service_id.forEach((id: string) => params.append('service_id', id))
      if (filters.doctor_id?.length) filters.doctor_id.forEach((id: string) => params.append('doctor_id', id))
      if (filters.status?.length) filters.status.forEach((s: string) => params.append('status[]', s))
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/appointments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch appointments')
      return response.json()
    },
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${id}`)
      if (!response.ok) throw new Error('Failed to fetch appointment')
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to create appointment')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string, status: AppointmentStatus, reason?: string }) => {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update status')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update appointment status')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to reschedule appointment')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
