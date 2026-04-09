import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
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
      .select('status, start_time', { count: 'exact' })
      .eq('clinic_id', clinicId)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd),

    // Current Month No-Show Stats + Joining services for ROI
    supabase.from('appointments')
      .select('id, status, services(price)', { count: 'exact' })
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
    supabase.from('payments') // Assuming payments table exists for captured deposits
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

    // Leads Stats
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

    // No-Shows This Week
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
  const calculateNoShowRate = (data: any[] | null) => {
    if (!data || data.length === 0) return 0
    const noShows = data.filter((a: any) => a.status === 'no_show').length
    return (noShows / data.length) * 100
  }

  const currentMonthRate = calculateNoShowRate(currentMonthStats.data)
  const lastMonthRate = calculateNoShowRate(lastMonthStats.data)

  // Today's Specific Stats (User Request)
  const todayLeadsCount = (totalLeads.data as any[])?.filter(l => 
    new Date(l.created_at).toDateString() === now.toDateString()
  ).length || 0

  const todayNoShowsCount = (todayAppointments.data as any[])?.filter(a => a.status === 'no_show').length || 0
  
  const todayRevenueRecovered = (todayAppointments.data as any[])?.filter(a => a.status === 'confirmed').length * 2000

  // Money Leak Logic: Patients with a completed appt but NO future scheduled appt
  const { data: allAppts } = await supabase
    .from('appointments')
    .select('patient_id, status, start_time')
    .eq('clinic_id', clinicId)

  const patientHistory: Record<string, { lastVisit: string, hasFuture: boolean }> = {}
  allAppts?.forEach((a: any) => {
    if (!patientHistory[a.patient_id]) {
      patientHistory[a.patient_id] = { lastVisit: '', hasFuture: false }
    }
    const start = new Date(a.start_time)
    if (a.status === 'completed' || a.status === 'visited') {
      if (!patientHistory[a.patient_id].lastVisit || start > new Date(patientHistory[a.patient_id].lastVisit)) {
        patientHistory[a.patient_id].lastVisit = a.start_time
      }
    }
    if (['scheduled', 'confirmed', 'pending'].includes(a.status) && start > now) {
      patientHistory[a.patient_id].hasFuture = true
    }
  })

  const moneyLeakIds = Object.keys(patientHistory).filter(id => 
    patientHistory[id].lastVisit && !patientHistory[id].hasFuture
  ).slice(0, 10)

  const { data: moneyLeakPatients } = await supabase
    .from('patients')
    .select('id, full_name, phone')
    .in('id', moneyLeakIds)

  const moneyLeakList = moneyLeakPatients?.map((p: any) => ({
    ...p,
    last_visit: patientHistory[p.id].lastVisit
  })) || []

  // Month Statistics
  const monthAppts = (currentMonthStats.data as any[]) || []
  const monthLeadsList = (totalLeads.data as any[])?.filter(l => new Date(l.created_at) >= new Date(monthStart)) || []
  
  const leadPipelineStats = {
    new: monthLeadsList.filter(l => l.status === 'new').length,
    contacted: monthLeadsList.filter(l => l.status === 'contacted').length,
    responsive: monthLeadsList.filter(l => l.status === 'responsive').length,
    booked: monthLeadsList.filter(l => l.status === 'booked').length,
    lost: monthLeadsList.filter(l => l.status === 'lost').length,
  }

  const leadConversionRate = monthLeadsList.length ? (monthLeadsList.filter(l => l.status === 'booked').length / monthLeadsList.length) * 100 : 0


  // ROI / Revenue Calculation
  const monthAppointments = (currentMonthStats.data as any[]) || []
  
  // Calculate Revenue: Sum of service prices for confirmed/completed
  // We'll use a pragmatic fallback of 2500 per appt if service price is missing or not joined
  const actualRevenue = monthAppointments.reduce((sum, appt) => {
    if (['confirmed', 'completed'].includes(appt.status)) {
      return sum + (appt.services?.price || 2500)
    }
    return sum
  }, 0)

  const totalDeposits = deposits.data?.reduce((sum: any, p: any) => sum + (p.amount || 0), 0) || 0
  const totalLeadsCount = totalLeads.count || 0
  const bookedLeadsCount = bookedLeads.count || 0
  const noShowsThisWeekCount = noShowsThisWeek.count || 0
  
  // No-Shows Prevented: Count appointments in 'confirmed' status
  const noShowsPreventedCount = monthAppointments.filter(a => a.status === 'confirmed').length
  
  // Iron-Clad ROI Calculation: 
  // (Recovered Leads * 2000) + (Confirmed/Recovered No-Shows * 1500)
  const estimatedRevenueRecovered = (bookedLeadsCount * 2000) + (noShowsPreventedCount * 1500)

  // Weekly Trend Chart Data
  const weekRows = weekAppointments.data || []
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyMap = new Map<number, { booked: number; total: number }>()
  
  for (const row of weekRows) {
    const day = new Date(row.start_time).getDay()
    const bucket = weeklyMap.get(day) || { booked: 0, total: 0 }
    bucket.total += 1
    if (['booked', 'confirmed', 'completed'].includes(row.status)) {
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
    weekly_bookings: weeklyBookings,
    actual_revenue: actualRevenue,
    money_leak_list: moneyLeakList,
    lead_pipeline_stats: leadPipelineStats,
    today_no_shows_count: todayNoShowsCount,
    today_leads_count: todayLeadsCount,
    today_revenue_recovered: todayRevenueRecovered
  })
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
