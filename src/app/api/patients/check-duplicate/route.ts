import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { phone } = await request.json()
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return new NextResponse('Unauthorized', { status: 403 })

  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name, phone')
    .eq('clinic_id', (staff as any).clinic_id)
    .eq('phone', phone)
    .single()

  return NextResponse.json(patient)
}