import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  const supabase = createClient() as any
  
  // Get current user's clinic
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  const clinicId = staff.clinic_id
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()
  const weekEnd = endOfWeek(now).toISOString()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()
  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
  const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString()

  // Execute queries in parallel for performance
  const [
    todayAppointments,
    weekAppointments,
    currentMonthStats,
    lastMonthStats,
    deposits,
    pendingConfirmations,
    followups,
    waitingList,
    totalLeads,
    bookedLeads,
    uncontactedLeads,
    noShowsThisWeek
  ] = await Promise.all([
    // Today's Appointments
    supabase.from('appointments')
      .select('status', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd),
      
    // Week Appointments
    supabase.from('appointments')
      .select('status', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd),

    // Current Month No-Show Stats
    supabase.from('appointments')
      .select('status', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .gte('start_time', monthStart)
      .lte('start_time', monthEnd),

    // Last Month No-Show Stats
    supabase.from('appointments')
      .select('status', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .gte('start_time', lastMonthStart)
      .lte('start_time', lastMonthEnd),

    // Deposits
    supabase.from('payments')
      .select('amount', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .eq('status', 'captured')
      .gte('created_at', monthStart),

    // Pending Confirmations
    supabase.from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'pending')
      .gte('start_time', todayStart),

    // Follow-ups Due
    supabase.from('followups')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'pending')
      .lte('due_date', todayEnd),

    // Waiting List
    supabase.from('waiting_list')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'active'),

    supabase.from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId),

    supabase.from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'booked'),

    supabase.from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'new'),

    supabase.from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'no_show')
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd)
  ])

  // Process Stats
  const todayTotal = todayAppointments.count || 0
  const todayConfirmed = todayAppointments.data?.filter((a: any) => a.status === 'confirmed').length || 0
  const todayPending = todayAppointments.data?.filter((a: any) => a.status === 'pending').length || 0

  const weekTotal = weekAppointments.count || 0
  const weekCompleted = weekAppointments.data?.filter((a: any) => a.status === 'completed').length || 0

  // No Show Rate Calculation
  const calculateNoShowRate = (data: any[]) => {
    const total = data.length
    if (total === 0) return 0
    const noShows = data.filter((a: any) => a.status === 'no_show').length
    return (noShows / total) * 100
  }

  const currentMonthRate = calculateNoShowRate(currentMonthStats.data || [])
  const lastMonthRate = calculateNoShowRate(lastMonthStats.data || [])

  // Deposits
  const totalDeposits = deposits.data?.reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0
  const totalLeadsCount = totalLeads.count || 0
  const bookedLeadsCount = bookedLeads.count || 0
  const noShowsThisWeekCount = noShowsThisWeek.count || 0
  const noShowsPreventedCount = Math.max(weekTotal - noShowsThisWeekCount - (weekAppointments.data?.filter((a: any) => a.status === 'pending').length || 0), 0)
  const estimatedRevenueRecovered = bookedLeadsCount * 1500
  const weekRows = weekAppointments.data || []
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyMap = new Map<number, { booked: number; total: number }>()
  for (const row of weekRows) {
    const day = new Date(row.start_time).getDay()
    const bucket = weeklyMap.get(day) || { booked: 0, total: 0 }
    bucket.total += 1
    if (row.status === 'booked' || row.status === 'confirmed' || row.status === 'completed') {
      bucket.booked += 1
    }
    weeklyMap.set(day, bucket)
  }
  const weeklyBookings = labels.map((day, index) => {
    const bucket = weeklyMap.get(index) || { booked: 0, total: 0 }
    return {
      day,
      booked: bucket.booked,
      conversionRate: bucket.total ? Number(((bucket.booked / bucket.total) * 100).toFixed(1)) : 0,
    }
  })

  return NextResponse.json({
    today_appointments_count: todayTotal,
    today_confirmed_count: todayConfirmed,
    today_pending_count: todayPending,
    week_appointments_count: weekTotal,
    week_completed_count: weekCompleted,
    no_show_rate_current_month: currentMonthRate,
    no_show_rate_last_month: lastMonthRate,
    deposits_collected_this_month: totalDeposits,
    deposits_count: deposits.count || 0,
    pending_confirmations_count: pendingConfirmations.count || 0,
    followups_due_count: followups.count || 0,
    waiting_list_count: waitingList.count || 0,
    total_leads_count: totalLeadsCount,
    booked_leads_count: bookedLeadsCount,
    no_shows_this_week: noShowsThisWeekCount,
    no_shows_prevented_count: noShowsPreventedCount,
    estimated_revenue_recovered: estimatedRevenueRecovered,
    uncontacted_leads_count: uncontactedLeads.count || 0,
    weekly_bookings: weeklyBookings
  })
}
