import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/portal/session'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason } = await request.json()
  const supabase = createClient() as any

  // Verify ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', params.id)
    .eq('patient_id', session.patient_id)
    .single()

  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('appointments')
    .update({ 
      status: 'cancellation_requested',
      notes: `Cancellation Request: ${reason}`
    })
    .eq('id', params.id)

  return NextResponse.json({ success: true })
}
