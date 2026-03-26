import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceSchema } from '@/lib/validations/service'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
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

  const json = await request.json()
  const body = createServiceSchema.parse(json)

  const { data: service, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json(service)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Soft delete
  const { error } = await supabase
    .from('services')
    .update({ is_deleted: true })
    .eq('id', params.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json({ success: true })
}
