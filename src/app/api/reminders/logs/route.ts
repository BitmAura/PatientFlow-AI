import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  
  const from = searchParams.get('date_from')
  const to = searchParams.get('date_to')
  const types = searchParams.get('types')?.split(',')
  const statuses = searchParams.get('statuses')?.split(',')
  const search = searchParams.get('search')

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  let query = supabase
    .from('reminder_logs')
    .select('*, patients!inner(full_name, phone)', { count: 'exact' })
    .eq('clinic_id', staff.clinic_id)
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  if (types && types.length) query = query.in('type', types)
  if (statuses && statuses.length) query = query.in('status', statuses)
  
  if (search) {
    query = query.or(`patients.full_name.ilike.%${search}%,patients.phone.ilike.%${search}%`)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching logs:', error)
    return new NextResponse('Failed to fetch logs', { status: 500 })
  }

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
