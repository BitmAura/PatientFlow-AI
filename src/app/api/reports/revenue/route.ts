import { NextResponse } from 'next/server'
import { getRevenueStats, DateRange } from '@/lib/services/stats'
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
    
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })
  const clinic = { id: staff.clinic_id }

  const dateRange: DateRange = {
    from: new Date(from),
    to: new Date(to)
  }

  const stats = await getRevenueStats(clinic.id, dateRange)

  return NextResponse.json(stats)
}
