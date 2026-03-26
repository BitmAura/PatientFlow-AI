import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updatePatientSchema } from '@/lib/validations/patient'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
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
  
  const { data, error } = await (supabase as any)
    .from('patients')
    .update(result.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json(data)
}