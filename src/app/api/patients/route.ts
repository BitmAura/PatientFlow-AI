import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createPatientSchema, patientFiltersSchema } from '@/lib/validations/patient'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  const supabase = createClient() as any

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .eq('clinic_id', staff.clinic_id)

  // Filters
  if (queryParams.search) {
    query = query.or(`full_name.ilike.%${queryParams.search}%,phone.ilike.%${queryParams.search}%,email.ilike.%${queryParams.search}%`)
  }
  if (queryParams.is_vip === 'true') query = query.eq('is_vip', true)
  if (queryParams.requires_deposit === 'true') query = query.eq('requires_deposit', true)
  if (queryParams.no_show_min) query = query.gte('no_shows', parseInt(queryParams.no_show_min))
  if (queryParams.source) query = query.eq('source', queryParams.source)

  // Pagination
  const page = parseInt(queryParams.page || '1')
  const limit = parseInt(queryParams.limit || '20')
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, count, error } = await query

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json({ data, count, page, limit })
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = createPatientSchema.safeParse({
    ...body,
    dob: body.dob ? new Date(body.dob) : undefined
  })

  if (!result.success) {
    return new NextResponse(JSON.stringify(result.error.flatten()), { status: 400 })
  }

  const supabase = createClient() as any
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return new NextResponse('Unauthorized', { status: 403 })

  // Check duplicate phone
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('clinic_id', staff.clinic_id)
    .eq('phone', result.data.phone)
    .single()

  if (existing) {
    return new NextResponse('Patient with this phone number already exists', { status: 409 })
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      ...result.data,
      clinic_id: staff.clinic_id,
    })
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json(data)
}
