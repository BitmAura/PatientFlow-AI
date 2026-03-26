import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { Clinic } from '@/types/database'

interface AuthState {
  user: User | null
  clinic: Clinic | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setClinic: (clinic: Clinic | null) => void
  clearAuth: () => void
  setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  clinic: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setClinic: (clinic) => set({ clinic }),
  clearAuth: () => set({ user: null, clinic: null, isAuthenticated: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))
