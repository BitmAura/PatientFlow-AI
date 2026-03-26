import { createClient } from '@/lib/supabase/server'
import { NOTIFICATION_TYPES } from '@/constants/notification-types'

export type NotificationType = keyof typeof NOTIFICATION_TYPES
export type NotificationData = Record<string, any>

export async function createNotification(
  clinicId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  const supabase = createClient() as any
  
  // Format message using template
  const typeConfig = NOTIFICATION_TYPES[type]
  let message = typeConfig.template
  
  Object.keys(data).forEach(key => {
    message = message.replace(`{{${key}}}`, data[key])
  })

  await supabase.from('notifications').insert({
    clinic_id: clinicId,
    type,
    title: typeConfig.title,
    message,
    data,
    read: false,
    created_at: new Date().toISOString()
  })
}

export async function getUnreadCount(clinicId: string): Promise<number> {
  const supabase = createClient() as any
  
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('read', false)

  return count || 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createClient() as any
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
}

export async function markAllAsRead(clinicId: string): Promise<void> {
  const supabase = createClient() as any
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('clinic_id', clinicId)
    .eq('read', false)
}
