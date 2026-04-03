import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceSchema } from '@/lib/validations/service'
import { writeAuditLog } from '@/lib/audit/log'

async function getClinicId(supabase: any, userId: string): Promise<string | null> {
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', userId)
    .single()
  return staff?.clinic_id ?? null
}

export async function GET(
  request: Request,
  context: any
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const clinicId = await getClinicId(supabase, user.id)
  if (!clinicId) return new NextResponse('Clinic not found', { status: 404 })

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)
    .single()

  if (error || !service) return new NextResponse('Not found', { status: 404 })

  return NextResponse.json(service)
}

export async function PUT(
  request: Request,
  context: any
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const clinicId = await getClinicId(supabase, user.id)
  if (!clinicId) return new NextResponse('Clinic not found', { status: 404 })

  const { data: current } = await supabase
    .from('services')
    .select('id, name, price, duration')
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)
    .single()

  if (!current) return new NextResponse('Not found', { status: 404 })

  const json = await request.json()
  const body = createServiceSchema.parse(json)

  const { data: service, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: 'update',
    entityType: 'service',
    entityId: context.params.id,
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
  context: any
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const clinicId = await getClinicId(supabase, user.id)
  if (!clinicId) return new NextResponse('Clinic not found', { status: 404 })

  const { data: current } = await supabase
    .from('services')
    .select('id, name')
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)
    .single()

  if (!current) return new NextResponse('Not found', { status: 404 })

  const { error } = await supabase
    .from('services')
    .update({ is_deleted: true })
    .eq('id', context.params.id)
    .eq('clinic_id', clinicId)

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: 'delete',
    entityType: 'service',
    entityId: context.params.id,
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
