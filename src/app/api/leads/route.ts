import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createLeadSchema } from '@/lib/validations/lead'

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