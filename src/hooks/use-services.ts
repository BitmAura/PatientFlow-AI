import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateServiceValues } from '@/lib/validations/service'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error('Failed to fetch services')
      return res.json()
    }
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const res = await fetch(`/api/services/${id}`)
      if (!res.ok) throw new Error('Failed to fetch service')
      return res.json()
    },
    enabled: !!id
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateServiceValues) => {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: CreateServiceValues }) => {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete service')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}

export function useReorderServices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orders: { id: string, order: number }[]) => {
      const res = await fetch('/api/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      })
      if (!res.ok) throw new Error('Failed to reorder services')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })
}
