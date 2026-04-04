import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Waitlist AI: Automated slot-filling for high-ticket cancellations
 * 🤖 Activated by: agency-ai-engineer
 */

export interface WaitlistRecoveryCandidate {
  id: string
  full_name: string
  phone: string
  interest: string
  treatment_tier: 'tier_1' | 'tier_2' | 'tier_3'
}

export async function findHighValueWaitlistCandidates(
  clinicId: string,
  limit: number = 5
): Promise<WaitlistRecoveryCandidate[]> {
  const supabase = createAdminClient() as any

  // 1. Find leads who are "lost" or "new" but have high-ticket interest
  // Using the tier_1 designated cases (Implants, Ortho, etc.)
  const { data: candidates, error } = await supabase
    .from('leads')
    .select('id, full_name, phone, interest, treatment_tier')
    .eq('clinic_id', clinicId)
    .eq('treatment_tier', 'tier_1')
    .in('status', ['new', 'contacted', 'lost'])
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error || !candidates) {
    console.error('Waitlist AI: No candidates found or error', error)
    return []
  }

  return candidates as WaitlistRecoveryCandidate[]
}

export function generateRecoveryMessage(
  candidateName: string, 
  procedure: string
): string {
  return `Hi ${candidateName}, we just had a last-minute cancellation for a ${procedure} slot tomorrow. Since you expressed interest earlier, we wanted to give you first priority. Would you like to secure this spot?`
}
