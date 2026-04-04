import { createAdminClient } from '@/lib/supabase/admin'

/**
 * WhatsApp Usage Tracker (Trial Safeguard)
 * 🚀 Activated by: CEO/Founder Persona
 * 🏗️ Built by: Backend Architect
 * Purpose: Prevents API cost abuse by monitoring clinic message volume.
 */
export async function getMonthlyWhatsAppUsage(clinicId: string): Promise<number> {
  const supabase = createAdminClient() as any
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('reminder_logs')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'sent')
    .gte('created_at', firstDayOfMonth.toISOString())

  if (error) {
    console.error('Usage Check Error:', error)
    return 0
  }

  return count || 0
}

/**
 * Check Quota Before Sending
 */
export async function canClinicSendMessage(clinicId: string, limit: number = 500): Promise<boolean> {
  const usage = await getMonthlyWhatsAppUsage(clinicId)
  return usage < limit
}
