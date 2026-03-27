import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { endOfWeek, startOfWeek, subWeeks } from 'date-fns'

export async function GET() {
  const supabase = createClient() as any

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  const clinicId = staff.clinic_id
  const now = new Date()
  const weekStart = startOfWeek(now).toISOString()
  const weekEnd = endOfWeek(now).toISOString()

  const [
    leads,
    appointments,
    noShows,
    recalls,
    capturedPayments,
    unfollowedLeads,
    messageLogs,
    weeklyBuckets,
  ] = await Promise.all([
    supabase.from('leads').select('id, status, created_at', { count: 'exact' }).eq('clinic_id', clinicId),
    supabase
      .from('appointments')
      .select('id, status, created_at, start_time', { count: 'exact' })
      .eq('clinic_id', clinicId),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'no_show')
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd),
    supabase
      .from('patient_recalls')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'booked'),
    supabase
      .from('payments')
      .select('amount', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .eq('status', 'captured'),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'new')
      .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()),
    supabase
      .from('message_logs')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'failed'),
    Promise.all(
      Array.from({ length: 6 }).map(async (_, idx) => {
        const start = startOfWeek(subWeeks(now, 5 - idx)).toISOString()
        const end = endOfWeek(subWeeks(now, 5 - idx)).toISOString()
        const [wLeads, wBooked] = await Promise.all([
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .gte('created_at', start)
            .lte('created_at', end),
          supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .in('status', ['booked', 'confirmed', 'completed'])
            .gte('created_at', start)
            .lte('created_at', end),
        ])
        const leadsCount = wLeads.count || 0
        const bookedCount = wBooked.count || 0
        return {
          week: `W${idx + 1}`,
          leads: leadsCount,
          booked: bookedCount,
          conversionRate: leadsCount ? Number(((bookedCount / leadsCount) * 100).toFixed(1)) : 0,
        }
      })
    ),
  ])

  const totalLeads = leads.count || 0
  const bookedAppointments = (appointments.data || []).filter(
    (row: { status: string }) => row.status === 'booked' || row.status === 'confirmed' || row.status === 'completed'
  ).length
  const completedAppointments = (appointments.data || []).filter(
    (row: { status: string }) => row.status === 'completed'
  ).length
  const totalNoShows = noShows.count || 0
  const recoveredPatients = recalls.count || 0

  const paymentRows = (capturedPayments.data || []) as Array<{ amount?: number | null }>
  const revenueGenerated = paymentRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const funnel = {
    leads: totalLeads,
    booked: bookedAppointments,
    completed: completedAppointments,
    bookedConversionRate: totalLeads ? Number(((bookedAppointments / totalLeads) * 100).toFixed(1)) : 0,
    completedConversionRate: totalLeads ? Number(((completedAppointments / totalLeads) * 100).toFixed(1)) : 0,
  }

  return NextResponse.json({
    metrics: {
      totalLeads,
      bookedAppointments,
      noShows: totalNoShows,
      recoveredPatients,
      revenueGenerated,
    },
    funnel,
    alerts: {
      unfollowedLeads: unfollowedLeads.count || 0,
      missedAppointments: totalNoShows,
      failedMessages: messageLogs.count || 0,
    },
    weeklyTrends: weeklyBuckets,
  })
}
