import { useQuery } from '@tanstack/react-query'

export function useAvailableSlots({
  date,
  serviceId,
  doctorId,
}: {
  date: Date | undefined
  serviceId: string | undefined
  doctorId?: string
}) {
  return useQuery({
    queryKey: ['available-slots', date, serviceId, doctorId],
    queryFn: async () => {
      if (!date || !serviceId) return []
      
      const params = new URLSearchParams({
        date: date.toISOString(),
        service_id: serviceId,
      })
      
      if (doctorId) params.append('doctor_id', doctorId)

      const response = await fetch(`/api/appointments/available-slots?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch slots')
      
      return response.json()
    },
    enabled: !!date && !!serviceId,
  })
}
