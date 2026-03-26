import { createClient } from '@/lib/supabase/server'

// Default limit per day
const DAILY_LIMIT = 200

export async function checkRateLimit(clinicId: string): Promise<boolean> {
  const supabase = createClient()
  
  // In a real production app, we would use Redis for fast rate limiting
  // For this MVP, we'll check the database count for today's logs
  
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00.000Z`
  const endOfDay = `${today}T23:59:59.999Z`

  const { count, error } = await supabase
    .from('reminder_logs')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'sent') // Only count successfully sent messages or attempted sends? Usually attempts.
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  if (error) {
    console.error('Rate limit check failed:', error)
    return false // Fail safe
  }

  return (count || 0) < DAILY_LIMIT
}

export async function getRemainingQuota(clinicId: string): Promise<number> {
  const supabase = createClient()
  
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00.000Z`
  const endOfDay = `${today}T23:59:59.999Z`

  const { count } = await supabase
    .from('reminder_logs')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  return Math.max(0, DAILY_LIMIT - (count || 0))
}
