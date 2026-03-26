import { create } from 'zustand'
import { Clinic } from '@/types/database'

interface ClinicState {
  clinic: Clinic | null
  isLoading: boolean
  whatsappStatus: 'connected' | 'disconnected' | 'connecting' | 'expired'
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise'
    status: 'active' | 'past_due' | 'canceled'
    usage: {
      appointments: number
      limit: number
    }
  }
  setClinic: (clinic: Clinic | null) => void
  setLoading: (loading: boolean) => void
  setWhatsappStatus: (status: ClinicState['whatsappStatus']) => void
  setSubscription: (subscription: ClinicState['subscription']) => void
}

export const useClinicStore = create<ClinicState>((set) => ({
  clinic: null,
  isLoading: false,
  whatsappStatus: 'disconnected',
  subscription: {
    plan: 'starter',
    status: 'active',
    usage: {
      appointments: 0,
      limit: 200,
    },
  },
  setClinic: (clinic) => set({ clinic }),
  setLoading: (isLoading) => set({ isLoading }),
  setWhatsappStatus: (whatsappStatus) => set({ whatsappStatus }),
  setSubscription: (subscription) => set({ subscription }),
}))
