import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createLeadSchema } from '@/lib/validations/lead'
import { triggerAutomation } from '@/services/automation/engine'
import { writeAuditLog } from '@/lib/audit/log'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('clinic_id', (staff as any).clinic_id)

  // Apply filters
  if (queryParams.status) query = query.eq('status', queryParams.status)
  if (queryParams.source) query = query.eq('source', queryParams.source)
  if (queryParams.search) {
    query = query.or(`full_name.ilike.%${queryParams.search}%,phone.ilike.%${queryParams.search}%`)
  }

  const page = parseInt(queryParams.page || '1')
  const limit = parseInt(queryParams.limit || '10')
  const offset = (page - 1) * limit

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return new NextResponse('Failed to fetch leads', { status: 500 })
  }

  return NextResponse.json({
    leads: data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: Request) {
  const supabase = createClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  try {
    const body = await request.json()
    const parsed = createLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid lead payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const payload = {
      ...parsed.data,
      clinic_id: staff.clinic_id,
      status: parsed.data.status || 'new',
      source: parsed.data.source || 'manual',
    }

    if (payload.phone) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('clinic_id', staff.clinic_id)
        .eq('phone', payload.phone)
        .limit(1)
        .maybeSingle()

      if (existingLead?.id) {
        return NextResponse.json({ error: 'Lead with this phone already exists' }, { status: 409 })
      }
    }

    const { data: created, error } = await supabase
      .from('leads')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create lead', details: error.message }, { status: 500 })
    }

    if (created?.phone && created?.status === 'new') {
      await triggerAutomation({
        type: 'lead.created',
        clinicId: staff.clinic_id,
        phone: created.phone,
        payload: { leadId: created.id, source: created.source || 'manual' },
      })
    }

    await writeAuditLog({
      clinicId: staff.clinic_id,
      userId: user.id,
      action: 'create',
      entityType: 'lead',
      entityId: created.id,
      newValues: {
        status: created.status,
        source: created.source,
      },
      request,
    })

    return NextResponse.json({ lead: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error while creating lead' },
      { status: 500 }
    )
  }
}