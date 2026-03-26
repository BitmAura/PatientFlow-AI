import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentActivity } from '@/lib/services/activity'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const activities = await getRecentActivity((clinic as any).id, limit)

  return NextResponse.json(activities)
}