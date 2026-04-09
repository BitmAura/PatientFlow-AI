'use client'

import { useQuery } from '@tanstack/react-query'

export type RecoveryPeriod = 'month' | 'quarter' | 'year'

export interface RecoverySummary {
  total_recovered_revenue: number
  recall_revenue: number
  noshow_recovery_revenue: number
  recall_patients_returned: number
  noshow_patients_recovered: number
  total_recalls_sent: number
  total_no_shows: number
  recall_conversion_rate: number
  noshow_recovery_rate: number
  recall_growth_vs_prev: number | null
}

export interface RevenueRecoveryData {
  period: string
  period_label: string
  summary: RecoverySummary
  recall_details: Array<{
    patient_id: string
    treatment_category: string
    contacted_at: string
    appointment_date: string
    service_name: string
    service_price: number
  }>
  noshow_details: Array<{
    patient_id: string
    noshow_date: string
    rebooked_date: string
    service_name: string
    service_price: number
  }>
}

export function useRevenueRecovery(period: RecoveryPeriod = 'month') {
  return useQuery({
    queryKey: ['revenue-recovery', period],
    queryFn: async (): Promise<RevenueRecoveryData> => {
      const res = await fetch(`/api/reports/revenue-recovery?period=${period}`)
      if (!res.ok) throw new Error('Failed to load revenue recovery data')
      return res.json()
    },
    staleTime: 5 * 60_000, // 5 min
    refetchOnWindowFocus: false,
  })
}
