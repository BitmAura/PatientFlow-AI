import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function usePortalSession() {
  // Client-side check can read from a simple API endpoint or just assume 
  // if request fails with 401 we redirect.
  // For UI state, we can keep a local user object if verify-otp returns it.
  return { patient: null, isLoggedIn: false } // Simplified for hook signature
}

export function useSendOTP() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch('/api/portal/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      if (!res.ok) throw new Error('Failed to send OTP')
      return res.json()
    }
  })
}

export function useVerifyOTP() {
  const router = useRouter()
  return useMutation({
    mutationFn: async ({ phone, otp }: { phone: string, otp: string }) => {
      const res = await fetch('/api/portal/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })
      if (!res.ok) throw new Error('Invalid OTP')
      return res.json()
    },
    onSuccess: () => {
      router.push('/portal/appointments')
    }
  })
}

export function usePortalLogout() {
  const router = useRouter()
  return useMutation({
    mutationFn: async () => {
      await fetch('/api/portal/logout', { method: 'POST' })
    },
    onSuccess: () => {
      router.push('/portal/login')
    }
  })
}
