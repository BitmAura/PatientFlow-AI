import { SupabaseClient } from '@supabase/supabase-js'
import { AudienceFilters } from '@/lib/validations/campaign'
import { subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export function buildAudienceQuery(
  supabase: SupabaseClient,
  clinicId: string,
  campaignType: string,
  filters: AudienceFilters
) {
  let query = supabase
    .from('patients')
    .select('id, full_name, phone, last_visit_date, date_of_birth', { count: 'exact' })
    .eq('clinic_id', clinicId)

  // Global exclusion
  if (filters.exclude_opted_out) {
    // Assuming there's a flag, if not present in schema, we skip or assume logic
    // query = query.eq('opt_out', false)
  }

  switch (campaignType) {
    case 'checkup_reminder':
      if (filters.months_since_visit) {
        const dateThreshold = subMonths(new Date(), parseInt(filters.months_since_visit)).toISOString()
        query = query.lt('last_visit_date', dateThreshold)
      }
      break

    case 'no_show_reengagement':
      if (filters.min_no_shows) {
        // This assumes we have a no_show_count column or similar logic
        // If not directly on patients, we'd need a subquery or join, but Supabase JS client 
        // handles simple filters best. Let's assume a computed column or direct column exists for MVP efficiency
        // or we filter post-fetch if dataset is small (bad for scale).
        // Best approach for MVP: assume a 'no_show_count' column exists on patients view or table
        // query = query.gte('no_show_count', filters.min_no_shows)
      }
      break

    case 'birthday_wishes':
      // Date math in SQL via Supabase is tricky without raw SQL RPCs
      // We will likely need a Postgres Function `get_patients_with_birthday(clinic_id, range)`
      // For now, we'll implement a placeholder logic or use an RPC if available
      break

    case 'custom':
      // Implement custom dynamic filters
      if (filters.custom_conditions) {
        filters.custom_conditions.forEach(cond => {
          if (cond.operator === 'eq') query = query.eq(cond.field, cond.value)
          if (cond.operator === 'gt') query = query.gt(cond.field, cond.value)
          if (cond.operator === 'lt') query = query.lt(cond.field, cond.value)
          if (cond.operator === 'ilike') query = query.ilike(cond.field, `%${cond.value}%`)
        })
      }
      break
  }

  return query
}
