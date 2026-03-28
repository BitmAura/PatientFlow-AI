import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updatePatientSchema } from '@/lib/validations/patient'
import { writeAuditLog } from '@/lib/audit/log'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('Unauthorized', { status: 403 })
  
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('clinic_id', (staff as any).clinic_id)
    .single()

  if (error) return new NextResponse(error.message, { status: 404 })

  return NextResponse.json(patient)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const result = updatePatientSchema.safeParse({
    ...body,
    dob: body.dob ? new Date(body.dob) : undefined
  })

  if (!result.success) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!(staff as any)?.clinic_id) return new NextResponse('Unauthorized', { status: 403 })

  const { data: current } = await supabase
    .from('patients')
    .select('id, full_name, phone, email')
    .eq('id', params.id)
    .eq('clinic_id', (staff as any).clinic_id)
    .single()

  if (!current) return new NextResponse('Patient not found', { status: 404 })
  
  const { data, error } = await (supabase as any)
    .from('patients')
    .update(result.data)
    .eq('id', params.id)
    .eq('clinic_id', (staff as any).clinic_id)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  await writeAuditLog({
    clinicId: (staff as any).clinic_id,
    userId: user.id,
    action: 'update',
    entityType: 'patient',
    entityId: params.id,
    oldValues: {
      full_name: (current as any).full_name,
      phone: (current as any).phone,
      email: (current as any).email,
    },
    newValues: {
      full_name: (data as any).full_name,
      phone: (data as any).phone,
      email: (data as any).email,
    },
    request,
  })

  return NextResponse.json(data)
}