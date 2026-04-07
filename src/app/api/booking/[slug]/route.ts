import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit'

export async function GET(
  request: Request,
  context: any
) {
  const ip = getClientIp(request)
  const limiter = await checkRateLimitAsync(`booking-clinic:${ip}`, 120, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limiter.retryAfterSeconds),
          'X-RateLimit-Remaining': String(limiter.remaining),
        },
      }
    )
  }

  const supabase = createClient()

  // 1. Get clinic by slug
  const { data: clinic, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', context.params.slug)
    .single()

  if (error || !clinic) {
    return new NextResponse('Clinic not found', { status: 404 })
  }

  // 2. Get services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('clinic_id', (clinic as any).id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // 3. Get doctors
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*')
    .eq('clinic_id', (clinic as any).id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return NextResponse.json({
    clinic,
    services,
    doctors
  })
}
