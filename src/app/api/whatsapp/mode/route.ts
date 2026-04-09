import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const supabase = createClient() as any
  const { useSharedNumber } = await request.json()

  // 1. Get current clinic ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('No clinic found', { status: 404 })

  // 2. Update clinic settings
  const { data: updatedClinic, error } = await supabase
    .from('clinics')
    .update({ use_shared_number: useSharedNumber })
    .eq('id', staff.clinic_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: updatedClinic
  })
}
