import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  // Mock stats for now until we have real data populated
  // In production, we would use aggregate queries or a materialized view
  
  // Example query:
  // const { data } = await supabase.rpc('get_reminder_stats', { clinic_id: staff.clinic_id })
  
  const stats = {
    sent_today: 145,
    delivery_rate: 98.5,
    read_rate: 82.3,
    response_rate: 45.1,
    trends: {
      sent: 12, // +12% from yesterday
      delivery: 0.5,
      read: 2.1,
      response: -1.5
    }
  }

  return NextResponse.json(stats)
}
