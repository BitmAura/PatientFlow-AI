import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/portal/session'

export async function POST(
  request: Request,
  context: any
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { preferred_date, preferred_time, reason } = await request.json()
  const supabase = createClient() as any

  // Verify ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', context.params.id)
    .eq('patient_id', session.patient_id)
    .single()

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Create request record (assuming a requests table exists, or update status to 'reschedule_requested')
  // For MVP, update status and add note
  
  await supabase
    .from('appointments')
    .update({ 
      status: 'reschedule_requested',
      notes: `Reschedule Request: ${preferred_date} ${preferred_time}. Reason: ${reason}`
    })
    .eq('id', context.params.id)

  return NextResponse.json({ success: true })
}

