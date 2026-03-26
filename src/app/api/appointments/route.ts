import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createAppointmentSchema, appointmentFiltersSchema } from '@/lib/validations/appointment'
import { addMinutes, parse } from 'date-fns'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryParams = Object.fromEntries(searchParams.entries())
  
  // Parse array params manually since Object.fromEntries only takes last value
  const status = searchParams.getAll('status[]')
  
  const supabase = createClient()

  // Get current user's clinic
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(name, phone, email),
      services(name, duration, price),
      doctors(name)
    `)
    .eq('clinic_id', (staff as any).clinic_id)

  // Apply filters
  if (status.length > 0) query = query.in('status', status)
  if (queryParams.date) query = query.eq('start_time::date', queryParams.date)
  if (queryParams.doctor_id) query = query.eq('doctor_id', queryParams.doctor_id)
  if (queryParams.service_id) query = query.eq('service_id', queryParams.service_id)

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) {
    return new NextResponse('Failed to fetch appointments', { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate request
  const result = createAppointmentSchema.safeParse({
    ...body,
    start_time: new Date(body.start_time),
    end_time: addMinutes(new Date(body.start_time), body.duration || 30)
  })

  if (!result.success) {
    return new NextResponse('Invalid request data', { status: 400 })
  }

  const supabase = createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Get clinic ID from staff
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  // Create appointment - cast to any to bypass TypeScript strict checking
  const appointmentData = {
    ...result.data,
    clinic_id: (staff as any).clinic_id,
    created_by: user.id
  } as any

  const { data, error } = await (supabase as any)
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (error) {
    return new NextResponse('Failed to create appointment', { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}