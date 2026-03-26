import { useQuery, useMutation } from '@tanstack/react-query'
import { ConfirmBookingInput } from '@/lib/validations/booking'

export function useClinicBookingInfo(slug: string) {
  return useQuery({
    queryKey: ['clinic-booking-info', slug],
    queryFn: async () => {
      const res = await fetch(`/api/booking/${slug}`)
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error('Failed to fetch clinic info')
      }
      return res.json()
    },
    enabled: !!slug
  })
}

export function useAvailableSlots(slug: string, serviceId: string | null, date: string | undefined, doctorId?: string) {
  return useQuery({
    queryKey: ['booking-slots', slug, serviceId, date, doctorId],
    queryFn: async () => {
      const params = new URLSearchParams({
        service_id: serviceId!,
        date: date!
      })
      if (doctorId) params.append('doctor_id', doctorId)

      const res = await fetch(`/api/booking/${slug}/slots?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch slots')
      return res.json()
    },
    enabled: !!slug && !!serviceId && !!date
  })
}

export function useConfirmBooking() {
  return useMutation({
    mutationFn: async (data: ConfirmBookingInput) => {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to confirm booking')
      return res.json()
    }
  })
}

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: async ({ clinicId, amount }: { clinicId: string, amount: number }) => {
      const res = await fetch('/api/booking/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId, amount })
      })
      if (!res.ok) throw new Error('Failed to create payment order')
      return res.json()
    }
  })
}
