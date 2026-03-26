import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { useClinicStore } from '@/stores/clinic-store'

export function useClinic() {
  const supabase = createClient() as any
  const { setClinic } = useClinicStore()

  return useQuery({
    queryKey: ['clinic'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get clinic where user is staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single()

      if (staffError) throw staffError
      if (!staffData) return null

      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', staffData.clinic_id)
        .single()

      if (clinicError) throw clinicError
      
      setClinic(clinic)
      return clinic
    },
  })
}
