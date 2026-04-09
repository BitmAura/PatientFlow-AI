import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/inbox
 * Returns incoming patient messages for the clinic, newest first.
 * Query params:
 *   page    - 1-indexed page (default 1)
 *   limit   - results per page (default 30, max 100)
 *   status  - filter by status: received | processing | processed (optional)
 */
export async function GET(req: NextRequest) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return NextResponse.json({ error: 'Clinic not found' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '30')))
  const statusFilter = searchParams.get('status')
  const from = (page - 1) * limit

  const admin = createAdminClient() as any

  let query = admin
    .from('patient_messages')
    .select(
      `id, phone_number, content, status, received_at, created_at,
       patient_id,
       patients ( id, full_name, phone )`,
      { count: 'exact' }
    )
    .eq('clinic_id', staff.clinic_id)
    .order('received_at', { ascending: false })
    .range(from, from + limit - 1)

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: messages, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: messages ?? [], total: count ?? 0, page, limit })
}
