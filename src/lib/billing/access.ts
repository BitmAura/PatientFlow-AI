import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Server-side helper to check whether a user has active subscription access.
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkUserAccess(userId: string) {
  if (!userId) return { allowed: false, reason: 'missing_user' }
  const admin = createAdminClient() as any
  try {
    const { data: sub } = await admin
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .maybeSingle()

    if (!sub) return { allowed: false, reason: 'no_subscription' }

    const now = new Date()
    const currentEnd = sub.current_period_end ? new Date(sub.current_period_end) : null

    if (sub.status === 'active' || sub.status === 'trialing') {
      if (currentEnd && currentEnd < now) return { allowed: false, reason: 'expired' }
      return { allowed: true }
    }

    return { allowed: false, reason: sub.status || 'blocked' }
  } catch (err) {
    console.error('checkUserAccess error', err)
    return { allowed: false, reason: 'error' }
  }
}
