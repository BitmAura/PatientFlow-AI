'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type UserRole = 'owner' | 'admin' | 'staff'

export interface UserProfile {
  id: string
  user_id: string
  clinic_id: string
  full_name: string
  role: UserRole
  email: string
  clinic?: {
    name: string
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('staff')
          .select('*, clinic:clinics(name)')
          .eq('user_id', user.id)
          .maybeSingle()
        
        setProfile(profileData as unknown as UserProfile)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const isOwner = profile?.role === 'owner'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'

  return {
    user,
    profile,
    loading,
    role: profile?.role,
    isOwner,
    isAdmin,
    clinicId: profile?.clinic_id
  }
}
