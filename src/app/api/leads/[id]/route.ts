import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateLeadSchema } from '@/lib/validations/lead'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return new NextResponse('Unauthorized', { status: 403 })

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .eq('clinic_id', (staff as any).clinic_id)
    .single()

  if (error) return new NextResponse('Lead not found', { status: 404 })

  return NextResponse.json(data)
}