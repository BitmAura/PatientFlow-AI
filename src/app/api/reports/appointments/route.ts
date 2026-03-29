import { NextResponse } from 'next/server'
import { getAppointmentTrends, getBusiestTimes, DateRange } from '@/lib/services/stats'
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

  const [trends, busiestTimes] = await Promise.all([
    getAppointmentTrends(clinic.id, dateRange),
    getBusiestTimes(clinic.id, dateRange)
  ])

  // Aggregate by status
  const byStatus = {
    completed: trends.reduce((sum, t) => sum + t.completed, 0),
    no_shows: trends.reduce((sum, t) => sum + t.no_shows, 0),
    cancelled: trends.reduce((sum, t) => sum + t.cancelled, 0)
  }

  const bySourceBase = {
    dashboard: 0,
    booking_page: 0,
    walk_in: 0,
    phone: 0,
    other: 0,
  }

  const { data: sourceRows } = await (supabase as any)
    .from('appointments')
    .select('source')
    .eq('clinic_id', clinic.id)
    .gte('start_time', dateRange.from.toISOString())
    .lte('start_time', dateRange.to.toISOString())

  const bySource = (sourceRows || []).reduce((acc: any, row: any) => {
    const source = String(row?.source || '').toLowerCase()

    if (source === 'online_booking' || source.includes('booking')) {
      acc.booking_page += 1
    } else if (source.includes('walk')) {
      acc.walk_in += 1
    } else if (source.includes('phone') || source.includes('call')) {
      acc.phone += 1
    } else if (source === 'dashboard' || source === 'manual') {
      acc.dashboard += 1
    } else {
      acc.other += 1
    }

    return acc
  }, bySourceBase)

  return NextResponse.json({
    over_time: trends,
    by_status: byStatus,
    busiest_times: busiestTimes,
    by_source: bySource
  })
}
