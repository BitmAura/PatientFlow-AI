import { createAdminClient } from '@/lib/supabase/admin'

export async function suggestUpcomingSlots(clinicId: string): Promise<string[]> {
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('appointments')
    .select('start_time')
    .eq('clinic_id', clinicId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3)

  if (!data || data.length === 0) {
    return ['Tomorrow 10:00 AM', 'Tomorrow 12:00 PM', 'Tomorrow 4:00 PM']
  }

  return data.map((row: { start_time: string }) => new Date(row.start_time).toLocaleString())
}
