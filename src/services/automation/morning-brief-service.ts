import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils/format-currency'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function generateMorningBrief(clinicId: string) {
  const supabase = createAdminClient() as any
  const yesterday = subDays(new Date(), 1)
  const yStart = startOfDay(yesterday).toISOString()
  const yEnd = endOfDay(yesterday).toISOString()

  // 1. Fetch Yesterday's Stats
  const { data: yesterdayAppts } = await supabase
    .from('appointments')
    .select('id, status, services(price)')
    .eq('clinic_id', clinicId)
    .gte('start_time', yStart)
    .lte('start_time', yEnd)

  const appointmentsCount = yesterdayAppts?.length || 0
  const noShowsCount = yesterdayAppts?.filter((a: any) => a.status === 'no_show').length || 0
  const noShowRate = appointmentsCount ? ((noShowsCount / appointmentsCount) * 100).toFixed(1) : 0

  // Revenue Recovered Yesterday
  const revRecovered = (yesterdayAppts?.filter((a: any) => a.status === 'confirmed' || a.status === 'completed').length || 0) * 2000

  // 2. High Risk Today
  const todayStart = startOfDay(new Date()).toISOString()
  const { data: highRisk } = await supabase
    .from('appointments')
    .select('patient:patients(full_name), no_show_risk_score, start_time')
    .eq('clinic_id', clinicId)
    .gte('no_show_risk_score', 60)
    .gte('start_time', todayStart)
    .order('no_show_risk_score', { ascending: false })
    .limit(3)

  // 3. Lead & Recall Stats
  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .eq('clinic_id', clinicId)
    .gte('created_at', yStart)
    .lte('created_at', yEnd)

  // 4. Construct WhatsApp Content
  const riskList = highRisk?.map((r: any) => `• ${r.patient.full_name} (${r.no_show_risk_score}% risk)`).join('\n') || 'None'

  const message = `*Your clinic brief for ${yesterday.toLocaleDateString()}* 🏥

📊 *Yesterday's Performance*
- Appointments: ${appointmentsCount}
- No-shows: ${noShowsCount} (${noShowRate}%)
- Revenue recovered: ${formatCurrency(revRecovered)}
- New leads: ${leads?.length || 0}

⚠️ *Action Required Today*
*High-Risk Appointments:*
${riskList}

💰 *This Month So Far*
- Log in to dashboard to see full ROI.

_Sent by PatientFlow AI_`;

  return {
    message,
    stats: {
      appointmentsCount,
      noShowsCount,
      revRecovered,
      newLeads: leads?.length || 0
    }
  }
}
