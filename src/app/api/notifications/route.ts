import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUnreadCount } from '@/lib/services/notifications'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const read = searchParams.get('read')

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('clinic_id', (clinic as any).id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (read === 'false') {
    query = query.eq('read', false)
  }

  const { data: notifications, error } = await query

  if (error) {
    return new NextResponse('Failed to fetch notifications', { status: 500 })
  }

  const unreadCount = await getUnreadCount((clinic as any).id)

  return NextResponse.json({
    notifications,
    unreadCount
  })
}