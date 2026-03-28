import { NextResponse } from 'next/server'
import { markAllAsRead } from '@/lib/services/notifications'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', (clinic as any).id)
    .eq('read', false)

  await markAllAsRead((clinic as any).id)

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'update',
    entityType: 'notification_bulk',
    newValues: {
      marked_read_count: unreadCount || 0,
    },
    request,
  })

  return NextResponse.json({ success: true })
}