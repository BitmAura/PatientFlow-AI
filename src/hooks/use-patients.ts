import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePatients(filters: any) {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.is_vip) params.append('is_vip', 'true')
      if (filters.requires_deposit) params.append('requires_deposit', 'true')
      if (filters.no_show_min) params.append('no_show_min', filters.no_show_min.toString())
      if (filters.source) params.append('source', filters.source)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/patients?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      return response.json()
    },
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${id}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to create patient')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update patient')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete patient')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      
      if (!response.ok) return null
      return response.json()
    },
  })
}
