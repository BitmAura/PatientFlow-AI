import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  
  // Mock aggregation for MVP or simple count queries
  // Real implementation would ideally use a single SQL query or separate counts
  
  const { count: due_today } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', (staff as any).clinic_id)
    .eq('due_date', today)
    .eq('status', 'pending')

  const { count: overdue } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', (staff as any).clinic_id)
    .lt('due_date', today)
    .eq('status', 'pending')

  const { count: completed_today } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', (staff as any).clinic_id)
    .eq('completed_date', today)

  return NextResponse.json({
    due_today: due_today || 0,
    overdue: overdue || 0,
    completed_today: completed_today || 0
  })
}