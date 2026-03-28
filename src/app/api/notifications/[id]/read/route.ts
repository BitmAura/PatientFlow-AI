import { NextResponse } from 'next/server'
import { markAsRead } from '@/lib/services/notifications'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: notification } = await supabase
    .from('notifications')
    .select('id, read')
    .eq('id', params.id)
    .eq('clinic_id', (clinic as any).id)
    .single()

  if (!notification) return new NextResponse('Not found', { status: 404 })

  await markAsRead(params.id)

  await writeAuditLog({
    clinicId: (clinic as any).id,
    userId: user.id,
    action: 'update',
    entityType: 'notification',
    entityId: params.id,
    oldValues: {
      read: (notification as any).read,
    },
    newValues: {
      read: true,
    },
    request,
  })

  return NextResponse.json({ success: true })
}
