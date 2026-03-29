import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const clinicId = (staff as any).clinic_id
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  const [dueTodayResult, overdueResult, completedTodayResult] = await Promise.all([
    supabase
      .from('followups')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'pending')
      .gte('due_date', startOfToday.toISOString())
      .lt('due_date', startOfTomorrow.toISOString()),
    supabase
      .from('followups')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'pending')
      .lt('due_date', startOfToday.toISOString()),
    supabase
      .from('followups')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .in('status', ['sent', 'converted', 'completed'])
      .gte('updated_at', startOfToday.toISOString())
      .lt('updated_at', startOfTomorrow.toISOString()),
  ])

  return NextResponse.json({
    due_today: dueTodayResult.count || 0,
    overdue: overdueResult.count || 0,
    completed_today: completedTodayResult.count || 0
  })
}