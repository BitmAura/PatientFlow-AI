import { NextResponse } from 'next/server'
import { getAppointmentTrends, getTopNoShowPatients, getNoShowByService, DateRange } from '@/lib/services/stats'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  
  if (!from || !to) {
    return new NextResponse('Missing date range', { status: 400 })
  }

  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
    
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const dateRange: DateRange = {
    from: new Date(from),
    to: new Date(to)
  }

  const [trends, topPatients, byService] = await Promise.all([
    getAppointmentTrends(clinic.id, dateRange),
    getTopNoShowPatients(clinic.id),
    getNoShowByService(clinic.id, dateRange)
  ])

  // Transform trends for no-show rate over time
  const rateOverTime = trends.map(t => ({
    date: t.date,
    rate: t.total > 0 ? Math.round((t.no_shows / t.total) * 100) : 0
  }))

  // Calculate rate by day of week
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const rateByDayMap = new Map<string, { total: number, no_shows: number }>()
  
  trends.forEach(t => {
    const day = dayMap[new Date(t.date).getDay()]
    const current = rateByDayMap.get(day) || { total: 0, no_shows: 0 }
    current.total += t.total
    current.no_shows += t.no_shows
    rateByDayMap.set(day, current)
  })

  const rateByDay = Array.from(rateByDayMap.entries()).map(([day, stats]) => ({
    day,
    rate: stats.total > 0 ? Math.round((stats.no_shows / stats.total) * 100) : 0
  }))

  // Sort Mon-Sun
  const sortedRateByDay = rateByDay.sort((a, b) => {
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return order.indexOf(a.day) - order.indexOf(b.day)
  })

  return NextResponse.json({
    rate_over_time: rateOverTime,
    rate_by_day: sortedRateByDay,
    rate_by_service: byService,
    top_patients: topPatients
  })
}
