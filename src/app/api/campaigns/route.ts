import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCampaignSchema } from '@/lib/validations/campaign'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit
  const status = searchParams.get('status')

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  let query = supabase
    .from('campaigns')
    .select('*', { count: 'exact' })
    .eq('clinic_id', (staff as any).clinic_id)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return new NextResponse('Failed to fetch campaigns', { status: 500 })
  }

  return NextResponse.json({
    campaigns: data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit)
    }
  })
}