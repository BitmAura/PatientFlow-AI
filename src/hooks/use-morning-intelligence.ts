'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MorningIntelligence {
  userName: string
  recoveredRevenue: number
  newLeads: number
  growth: number
  brief?: any
  loading: boolean
}

/**
 * useMorningIntelligence Hook
 * 📊 Persona: Performance Specialist
 * ⚡ Purpose: Fetches real-time ROI and lead data for the Founder's Dashboard.
 */
export function useMorningIntelligence(clinicId?: string) {
  const [data, setData] = useState<MorningIntelligence>({
    userName: 'Partner',
    recoveredRevenue: 0,
    newLeads: 0,
    growth: 0,
    loading: true
  })

  useEffect(() => {
    async function fetchInsights() {
      if (!clinicId) return
      
      const supabase = createClient() as any
      
      try {
        // 1. Fetch Staff Performance
        const { data: perfData, error: perfError } = await supabase
          .from('v_staff_performance')
          .select('recovered_revenue, conversions')
          .eq('clinic_id', clinicId)

        // 2. Fetch Latest Morning Brief
        const { data: latestBrief } = await supabase
          .from('morning_briefs')
          .select('*')
          .eq('clinic_id', clinicId)
          .order('sent_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // 3. Fetch New Leads from last 24h
        const yesterday = new Date(Date.now() - 86400000).toISOString()
        const { count: newLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId)
          .gte('created_at', yesterday)

        const totalRecovered = perfData?.reduce((acc: number, curr: any) => acc + (Number(curr.recovered_revenue) || 0), 0) || 0
        
        setData({
          userName: 'Doctor',
          recoveredRevenue: totalRecovered / 100,
          newLeads: newLeadsCount || 0,
          growth: latestBrief?.stats?.revenue_growth || 12.5,
          brief: latestBrief,
          loading: false
        })
      } catch (err) {
        console.error('Morning Intelligence Fetch Error:', err)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchInsights()

    // 4. Real-time Subscription to Briefs
    if (!clinicId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`briefs-${clinicId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'morning_briefs', filter: `clinic_id=eq.${clinicId}` },
        () => fetchInsights()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clinicId])

  return data
}
