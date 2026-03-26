import { createClient } from '@/lib/supabase/server'
import { startOfDay, endOfDay, subDays, differenceInDays, format, isSameDay } from 'date-fns'

export type DateRange = {
  from: Date
  to: Date
}

export type Stats = {
  total_appointments: number
  completed: number
  no_shows: number
  cancelled: number
  no_show_rate: number
  completion_rate: number
  deposits_collected: number
  deposits_count: number
}

export async function calculateNoShowRate(clinicId: string, dateRange: DateRange) {
  const supabase = createClient() as any
  
  const { count: total } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  const { count: noShows } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('status', 'no_show')
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  if (!total || total === 0) return 0
  
  return Math.round(((noShows || 0) / total) * 100)
}

export async function getOverviewStats(clinicId: string, dateRange: DateRange): Promise<Stats> {
  const supabase = createClient() as any
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select('status, deposit_amount, deposit_status')
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  if (!appointments) {
    return {
      total_appointments: 0,
      completed: 0,
      no_shows: 0,
      cancelled: 0,
      no_show_rate: 0,
      completion_rate: 0,
      deposits_collected: 0,
      deposits_count: 0
    }
  }

  const total = appointments.length
  const completed = appointments.filter((a: any) => a.status === 'completed').length
  const noShows = appointments.filter((a: any) => a.status === 'no_show').length
  const cancelled = appointments.filter((a: any) => a.status === 'cancelled').length
  
  // Deposits - assuming deposit_status 'paid' means collected
  const paidDeposits = appointments.filter((a: any) => a.deposit_status === 'paid')
  const depositsCollected = paidDeposits.reduce((sum: number, a: any) => sum + (a.deposit_amount || 0), 0)

  return {
    total_appointments: total,
    completed,
    no_shows: noShows,
    cancelled,
    no_show_rate: total > 0 ? Math.round((noShows / total) * 100) : 0,
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    deposits_collected: depositsCollected,
    deposits_count: paidDeposits.length
  }
}

export async function getAppointmentTrends(clinicId: string, dateRange: DateRange) {
  const supabase = createClient() as any
  
  // Group by day
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, status')
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())
    .order('start_time')

  const days = differenceInDays(dateRange.to, dateRange.from) + 1
  const trends = []

  for (let i = 0; i < days; i++) {
    const date = subDays(dateRange.to, days - 1 - i)
    const dayAppointments = appointments?.filter((a: any) => isSameDay(new Date(a.start_time), date)) || []
    
    trends.push({
      date: format(date, 'yyyy-MM-dd'),
      total: dayAppointments.length,
      completed: dayAppointments.filter((a: any) => a.status === 'completed').length,
      no_shows: dayAppointments.filter((a: any) => a.status === 'no_show').length,
      cancelled: dayAppointments.filter((a: any) => a.status === 'cancelled').length
    })
  }

  return trends
}

export async function getTopNoShowPatients(clinicId: string, limit: number = 5) {
  const supabase = createClient() as any
  
  // This is complex in Supabase JS client without raw SQL or views. 
  // We will fetch all no-show appointments and aggregate in memory for MVP.
  // In production, use an RPC function or View.
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      patient_id,
      patients (id, name, phone, email),
      start_time,
      status
    `)
    .eq('clinic_id', clinicId)
    
  if (!appointments) return []

  const patientStats = new Map<string, { 
    patient: any, 
    no_shows: number, 
    total: number, 
    last_no_show: string | null 
  }>()

  appointments.forEach((app: any) => {
    if (!app.patients) return
    
    const pid = app.patient_id
    const current = patientStats.get(pid) || { 
      patient: app.patients, 
      no_shows: 0, 
      total: 0, 
      last_no_show: null 
    }

    current.total += 1
    if (app.status === 'no_show') {
      current.no_shows += 1
      if (!current.last_no_show || new Date(app.start_time) > new Date(current.last_no_show)) {
        current.last_no_show = app.start_time
      }
    }

    patientStats.set(pid, current)
  })

  return Array.from(patientStats.values())
    .filter(p => p.no_shows > 0)
    .sort((a, b) => b.no_shows - a.no_shows)
    .slice(0, limit)
    .map(p => ({
      ...p,
      rate: Math.round((p.no_shows / p.total) * 100)
    }))
}

export async function getBusiestTimes(clinicId: string, dateRange: DateRange) {
  const supabase = createClient() as any
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time')
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  // Initialize 7x24 grid (or 7x9 for 9AM-6PM)
  // We'll do simple Day (0-6) x Hour (0-23)
  const heatmap: { day: number; hour: number; count: number }[] = []
  
  // Initialize with 0
  for (let d = 0; d < 7; d++) {
    for (let h = 9; h <= 18; h++) { // Focus on business hours
      heatmap.push({ day: d, hour: h, count: 0 })
    }
  }

  appointments?.forEach((app: any) => {
    const date = new Date(app.start_time)
    const day = date.getDay() // 0 = Sun
    const hour = date.getHours()
    
    const slot = heatmap.find(h => h.day === day && h.hour === hour)
    if (slot) slot.count++
  })

  return heatmap
}

export async function getNoShowByService(clinicId: string, dateRange: DateRange) {
  const supabase = createClient() as any
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      status,
      services (name)
    `)
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  const serviceStats = new Map<string, { name: string, total: number, no_shows: number }>()

  appointments?.forEach((app: any) => {
    // @ts-ignore
    const serviceName = app.services?.name || 'Unknown'
    const current = serviceStats.get(serviceName) || { name: serviceName, total: 0, no_shows: 0 }
    
    current.total++
    if (app.status === 'no_show') current.no_shows++
    
    serviceStats.set(serviceName, current)
  })

  return Array.from(serviceStats.values())
    .map(s => ({
      service: s.name,
      count: s.total,
      no_show_count: s.no_shows,
      rate: s.total > 0 ? Math.round((s.no_shows / s.total) * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
}

export async function getRevenueStats(clinicId: string, dateRange: DateRange) {
  const supabase = createClient() as any
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, deposit_amount, deposit_status, status')
    .eq('clinic_id', clinicId)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())
    .order('start_time')

  const depositsOverTime = new Map<string, number>()
  let totalCollected = 0
  let pending = 0
  let refunded = 0
  let forfeited = 0

  appointments?.forEach((app: any) => {
    const date = format(new Date(app.start_time), 'yyyy-MM-dd')
    const amount = app.deposit_amount || 0
    
    if (app.deposit_status === 'paid') {
      depositsOverTime.set(date, (depositsOverTime.get(date) || 0) + amount)
      totalCollected += amount
    } else if (app.deposit_status === 'pending') {
      pending += amount
    } else if (app.deposit_status === 'refunded') {
      refunded += amount
    } else if (app.deposit_status === 'forfeited') { // e.g. no-show
      forfeited += amount
    }
  })

  // Fill in missing days for chart
  const days = differenceInDays(dateRange.to, dateRange.from) + 1
  const chartData = []
  for (let i = 0; i < days; i++) {
    const date = subDays(dateRange.to, days - 1 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    chartData.push({
      date: dateStr,
      amount: depositsOverTime.get(dateStr) || 0
    })
  }

  return {
    deposits_over_time: chartData,
    deposits_by_status: {
      paid: totalCollected,
      pending,
      refunded,
      forfeited
    },
    total_collected: totalCollected,
    // Estimate: assume each no-show saved would generate avg revenue
    // For now, just return 0 or calculate if we had service price info
    estimated_savings: 0 
  }
}
