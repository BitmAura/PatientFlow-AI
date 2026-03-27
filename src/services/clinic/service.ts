import { createClient } from '@/lib/supabase/server'

export async function getAuthenticatedClinicId(): Promise<string | null> {
  const supabase = createClient() as any
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return staff?.clinic_id || null
}

export async function assertClinicScope(clinicId: string, requestedClinicId?: string): Promise<boolean> {
  if (!requestedClinicId) return true
  return clinicId === requestedClinicId
}
