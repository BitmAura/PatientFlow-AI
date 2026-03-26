import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  // Check if log exists
  const { data: log } = await supabase
    .from('reminder_logs')
    .select('*')
    .eq('id', params.id)
    .eq('clinic_id', staff.clinic_id)
    .single()

  if (!log) return new NextResponse('Log not found', { status: 404 })

  // Here we would trigger the actual resend logic via queue or direct call
  // For MVP, we'll just update the status to 'pending' to simulate a retry
  
  const { error } = await supabase
    .from('reminder_logs')
    .update({ 
      status: 'pending', 
      updated_at: new Date().toISOString(),
      error_reason: null // Clear previous error
    })
    .eq('id', params.id)

  if (error) return new NextResponse('Failed to resend', { status: 500 })

  return NextResponse.json({ success: true })
}
