import { NextResponse } from 'next/server'
import { markAsRead } from '@/lib/services/notifications'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(
  request: Request,
  context: any
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })
  const clinicId = staff.clinic_id as string

  const { data: notification } = await supabase
    .from('notifications')
    .select('id, read')
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)
    .single()

  if (!notification) return new NextResponse('Not found', { status: 404 })

  await markAsRead(context.params.id)

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: 'update',
    entityType: 'notification',
    entityId: context.params.id,
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

