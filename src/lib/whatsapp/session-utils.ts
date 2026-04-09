import { createAdminClient } from '@/lib/supabase/admin'

/**
 * WhatsApp Session Utilities
 * 🏥 Purpose: Enforce Meta's 24-hour conversation window policy.
 */

export async function isWithinSessionWindow(clinicId: string, phoneNumber: string): Promise<boolean> {
  const supabase = createAdminClient() as any
  
  // A "Session" starts from the time of the last INBOUND (patient-to-clinic) message.
  // It lasts for 24 hours.
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: lastInbound, error } = await supabase
    .from('patient_messages')
    .select('created_at')
    .eq('clinic_id', clinicId)
    .eq('phone_number', phoneNumber)
    .eq('direction', 'inbound')
    .gt('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !lastInbound) {
    return false
  }

  return true
}

/**
 * Gets the expiration time of the current 24h window
 */
export async function getSessionExpiry(clinicId: string, phoneNumber: string): Promise<Date | null> {
  const supabase = createAdminClient() as any
  
  const { data: lastInbound } = await supabase
    .from('patient_messages')
    .select('created_at')
    .eq('clinic_id', clinicId)
    .eq('phone_number', phoneNumber)
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastInbound) return null

  const receivedAt = new Date(lastInbound.created_at)
  return new Date(receivedAt.getTime() + 24 * 60 * 60 * 1000)
}
