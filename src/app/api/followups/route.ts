import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFollowupSchema } from '@/lib/validations/followup'
import { createFollowup } from '@/lib/services/followups'
import { writeAuditLog } from '@/lib/audit/log'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const due = searchParams.get('due')

  const { data: staffResult } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  const staff = staffResult as { clinic_id: string } | null
  
  if (!staff || !staff.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  let query = supabase
    .from('followups')
    .select('*, patient:patients(full_name, phone)', { count: 'exact' })
    .eq('clinic_id', staff.clinic_id)
    .order('due_date', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (type) {
    query = query.eq('type', type)
  }

  if (due) {
    const today = new Date().toISOString().split('T')[0]
    if (due === 'today') {
      query = query.eq('due_date', today)
    } else if (due === 'overdue') {
      query = query.lt('due_date', today).eq('status', 'pending')
    } else if (due === 'upcoming') {
      query = query.gt('due_date', today)
    }
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) return new NextResponse('Failed to fetch followups', { status: 500 })

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staffResult } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  const staff = staffResult as { clinic_id: string } | null

  if (!staff || !staff.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const body = await request.json()
  const validation = createFollowupSchema.safeParse(body)

  if (!validation.success) {
    return new NextResponse('Invalid data', { status: 400 })
  }

  try {
    const followup = await createFollowup({
      ...validation.data,
      clinic_id: staff.clinic_id,
      created_by: user.id
    })

    await writeAuditLog({
      clinicId: staff.clinic_id,
      userId: user.id,
      action: 'create',
      entityType: 'followup',
      entityId: followup.id,
      newValues: {
        type: followup.type,
        status: followup.status,
        patient_id: followup.patient_id,
      },
      request,
    })

    return NextResponse.json(followup)
  } catch (error) {
    return new NextResponse('Failed to create followup', { status: 500 })
  }
}
