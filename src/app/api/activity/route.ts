import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentActivity } from '@/lib/services/activity'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const activities = await getRecentActivity((staff as any).clinic_id, limit)

  return NextResponse.json(activities)
}