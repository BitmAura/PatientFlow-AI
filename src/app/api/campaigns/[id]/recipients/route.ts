import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: any
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase
    .from('campaign_recipients')
    .select('*, patient:patients(full_name, phone)', { count: 'exact' })
    .eq('campaign_id', context.params.id)
    .order('created_at', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  if (search) {
    // Note: Search on joined table is tricky in simple select. 
    // Usually need !inner join or separate search logic.
    // For MVP we might skip or use client-side filtering if small list, 
    // or rely on full text search setup.
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) return new NextResponse('Failed to fetch recipients', { status: 500 })

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

