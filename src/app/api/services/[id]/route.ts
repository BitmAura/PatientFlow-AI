import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceSchema } from '@/lib/validations/service'
import { writeAuditLog } from '@/lib/audit/log'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('clinic_id', clinic.id)
    .single()

  if (error || !service) return new NextResponse('Not found', { status: 404 })

  return NextResponse.json(service)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: current } = await supabase
    .from('services')
    .select('id, name, price, duration')
    .eq('id', params.id)
    .eq('clinic_id', clinic.id)
    .single()

  if (!current) return new NextResponse('Not found', { status: 404 })

  const json = await request.json()
  const body = createServiceSchema.parse(json)

  const { data: service, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', params.id)
    .eq('clinic_id', clinic.id)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId: clinic.id,
    userId: user.id,
    action: 'update',
    entityType: 'service',
    entityId: params.id,
    oldValues: {
      name: (current as any).name,
      price: (current as any).price,
      duration: (current as any).duration,
    },
    newValues: {
      name: (service as any).name,
      price: (service as any).price,
      duration: (service as any).duration,
    },
    request,
  })

  return NextResponse.json(service)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  const { data: current } = await supabase
    .from('services')
    .select('id, name')
    .eq('id', params.id)
    .eq('clinic_id', clinic.id)
    .single()

  if (!current) return new NextResponse('Not found', { status: 404 })

  // Soft delete
  const { error } = await supabase
    .from('services')
    .update({ is_deleted: true })
    .eq('id', params.id)
    .eq('clinic_id', clinic.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId: clinic.id,
    userId: user.id,
    action: 'delete',
    entityType: 'service',
    entityId: params.id,
    oldValues: {
      name: (current as any).name,
    },
    newValues: {
      is_deleted: true,
    },
    request,
  })

  return NextResponse.json({ success: true })
}
