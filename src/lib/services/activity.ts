import { createClient } from '@/lib/supabase/server'

export interface Activity {
  id: string
  clinic_id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  metadata?: any
  created_at: string
  users?: { full_name: string, email: string }
}

export async function logActivity(
  clinicId: string,
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: object
): Promise<void> {
  const supabase = createClient() as any
  
  await supabase.from('activity_logs').insert({
    clinic_id: clinicId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString()
  })
}

export async function getRecentActivity(
  clinicId: string,
  limit: number = 10
): Promise<Activity[]> {
  const supabase = createClient() as any
  
  const { data } = await supabase
    .from('activity_logs')
    .select(`
      *,
      users (full_name, email)
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data as Activity[] || []
}
