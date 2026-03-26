import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { plan_id } = await request.json()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clinic) return new NextResponse('Clinic not found', { status: 404 })

  // Schedule downgrade at end of period (Razorpay API)
  // For now, update immediately
  const { error } = await supabase
    .from('clinics')
    .update({
      subscription_plan_id: plan_id
    })
    .eq('id', clinic.id)

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json({ success: true })
}
