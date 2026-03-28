import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: any
) {
  const supabase = createClient()
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (*),
      services (*),
      doctors (*),
      booked_by_staff:staff!booked_by (
        id, 
        users (full_name)
      )
    `)
    .eq('id', context.params.id)
    .single()

  if (error) return new NextResponse(error.message, { status: 404 })

  return NextResponse.json(appointment)
}

export async function DELETE(
  request: Request,
  context: any
) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', context.params.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  return new NextResponse(null, { status: 204 })
}

