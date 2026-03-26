import { NextResponse } from 'next/server'
import { getOverviewStats, DateRange } from '@/lib/services/stats'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

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
    
  // Assuming clinic_id is stored in user metadata or a separate profile table
  // For MVP, fetch clinic where user is member
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const currentRange: DateRange = {
    from: new Date(from),
    to: new Date(to)
  }

  // Calculate previous range for comparison (same duration shifted back)
  const duration = currentRange.to.getTime() - currentRange.from.getTime()
  const previousRange: DateRange = {
    from: new Date(currentRange.from.getTime() - duration),
    to: new Date(currentRange.from.getTime())
  }

  const [currentStats, previousStats] = await Promise.all([
    getOverviewStats(clinic.id, currentRange),
    getOverviewStats(clinic.id, previousRange)
  ])

  return NextResponse.json({
    ...currentStats,
    comparison: previousStats
  })
}
