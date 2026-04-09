import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useClinicStore } from '@/stores/clinic-store'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export interface DashboardStats {
  today_appointments_count: number
  today_confirmed_count: number
  today_pending_count: number
  week_appointments_count: number
  week_completed_count: number
  no_show_rate_current_month: number
  no_show_rate_last_month: number
  deposits_collected_this_month: number
  deposits_count: number
  pending_confirmations_count: number
  followups_due_count: number
  waiting_list_count: number
  total_leads_count: number
  booked_leads_count: number
  no_shows_this_week: number
  no_shows_prevented_count: number
  estimated_revenue_recovered: number
  uncontacted_leads_count: number
  weekly_bookings: Array<{ day: string; booked: number; conversionRate: number }>
  money_leak_list: Array<{ id: string; full_name: string; phone: string; last_visit: string }>
  lead_pipeline_stats: {
    new: number
    contacted: number
    responsive: number
    booked: number
    lost: number
  }
  today_no_shows_count: number
  today_leads_count: number
  today_revenue_recovered: number
}

export function useStats() {
  const { clinic } = useClinicStore()
  const queryClient = useQueryClient()

  // Real-time synchronization
  useEffect(() => {
    if (!clinic?.id) return

    const supabase = createClient()
    
    // Subscribe to all relevant tables for this clinic
    const channel = supabase
      .channel(`dashboard-realtime-${clinic.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `clinic_id=eq.${clinic.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats', clinic.id] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `clinic_id=eq.${clinic.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats', clinic.id] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'morning_briefs', filter: `clinic_id=eq.${clinic.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats', clinic.id] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clinic?.id, queryClient])

  return useQuery({
    queryKey: ['dashboard-stats', clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return null
      
      const response = await fetch('/api/stats/dashboard')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      return response.json() as Promise<DashboardStats>
    },
    enabled: !!clinic?.id,
  })
}
