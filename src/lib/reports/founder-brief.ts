import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Founder Daily Performance Aggregator
 * 🚀 Activated by: CEO/Founder Persona
 * 🏗️ Built by: Backend Architect
 * Purpose: Provides high-level business intelligence to the clinical owner.
 */

export interface FounderBrief {
  recoveredRevenue: number
  newLeads: number
  recallsSent: number
  efficiencyGrowth: number
}

const TIER_VALUES = {
  tier_1: 25000,
  tier_2: 8000,
  tier_3: 1000,
}

export async function getDailyFounderBrief(clinicId: string): Promise<FounderBrief> {
  const supabase = createAdminClient() as any
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 1. New Leads yesterday
  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', yesterday.toISOString())

  // 2. Recalls sent yesterday
  const { data: recalls } = await supabase
    .from('reminder_logs')
    .select('patient_id, created_at')
    .eq('clinic_id', clinicId)
    .eq('status', 'sent')
    .gte('created_at', yesterday.toISOString())

  const recallsSent = recalls?.length || 0

  // 3. Predicted Recovered Revenue (Based on Tier Values)
  // Fetch the leads linked to these recalls to get their tiers
  const { data: leads } = await supabase
    .from('leads')
    .select('treatment_tier')
    .eq('clinic_id', clinicId)
    .gte('updated_at', yesterday.toISOString())

  let recoveredRevenue = 0
  leads?.forEach((lead: any) => {
    const tier = lead.treatment_tier as keyof typeof TIER_VALUES
    recoveredRevenue += TIER_VALUES[tier || 'tier_3']
  })

  // 4. Efficiency Growth (Hardcoded mock for now)
  const efficiencyGrowth = 12.5

  return {
    recoveredRevenue,
    newLeads: newLeads || 0,
    recallsSent,
    efficiencyGrowth,
  }
}
