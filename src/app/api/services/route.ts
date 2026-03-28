import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceSchema } from '@/lib/validations/service'
import { writeAuditLog } from '@/lib/audit/log'

export async function GET(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('clinic_id', clinic.id)
    .eq('is_deleted', false)
    .order('display_order', { ascending: true })

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json(services)
}

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const json = await request.json()
  const body = createServiceSchema.parse(json)

  // Get max display order
  const { data: maxOrder } = await supabase
    .from('services')
    .select('display_order')
    .eq('clinic_id', clinic.id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.display_order || 0) + 1

  const { data: service, error } = await supabase
    .from('services')
    .insert({
      ...body,
      clinic_id: clinic.id,
      display_order: nextOrder
    })
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId: clinic.id,
    userId: user.id,
    action: 'create',
    entityType: 'service',
    entityId: service.id,
    newValues: {
      name: service.name,
      price: service.price,
      duration: service.duration,
    },
    request,
  })

  return NextResponse.json(service)
}
