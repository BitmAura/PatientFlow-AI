import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Price AI: Instant WhatsApp Procedure Quotes
 * 🤖 Activated by: agency-ai-engineer
 */

export interface TreatmentPrice {
  name: string
  category: string
  price_paise: number
  tier: 'tier_1' | 'tier_2' | 'tier_3'
  description?: string
}

export async function lookupTreatmentPrice(
  clinicId: string, 
  query: string
): Promise<TreatmentPrice | null> {
  const supabase = createAdminClient() as any
  const normalizedQuery = query.toLowerCase().trim()

  // 1. Exact or Fuzzy Match on Category/Name
  // In a real production app, we would use pg_trgm or Vector search
  const { data: treatments, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('clinic_id', clinicId)
    .or(`category.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
    .order('price_paise', { ascending: false }) // Prioritize higher-value if ambiguous
    .limit(1)

  if (error || !treatments || treatments.length === 0) {
    console.error('Price AI: No match found for', query)
    return null
  }

  return treatments[0] as TreatmentPrice
}

export function formatPriceInr(paise: number): string {
  const rs = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rs)
}
