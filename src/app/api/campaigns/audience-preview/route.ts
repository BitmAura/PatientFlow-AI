import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAudienceQuery } from '@/lib/campaigns/audience-filter'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const body = await request.json()
  const { campaign_type, filters } = body

  const query = buildAudienceQuery(supabase as any, (staff as any).clinic_id, campaign_type, filters)
  
  // We want to fetch a small sample
  const { data, count, error } = await query.range(0, 4)

  if (error) {
    return new NextResponse('Failed to get audience preview', { status: 500 })
  }

  return NextResponse.json({
    patients: data,
    total_count: count,
    estimated_reach: count
  })
}