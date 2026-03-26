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

  // Aggregate by Source (Mock data for now as source column might not exist yet)
  const bySource = {
    dashboard: Math.round(byStatus.completed * 0.4),
    booking_page: Math.round(byStatus.completed * 0.3),
    walk_in: Math.round(byStatus.completed * 0.2),
    phone: Math.round(byStatus.completed * 0.1)
  }

  return NextResponse.json({
    over_time: trends,
    by_status: byStatus,
    busiest_times: busiestTimes,
    by_source: bySource
  })
}
