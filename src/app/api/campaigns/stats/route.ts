import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  // Mock stats - in production use aggregation queries
  const stats = {
    total_campaigns: 12,
    messages_sent: 2450,
    response_rate: 18.5,
    bookings_generated: 45
  }

  return NextResponse.json(stats)
}