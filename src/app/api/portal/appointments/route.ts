import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/portal/session'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('portal_session')?.value
  const session = await verifyPortalSession(token)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient() as any
  
  // Fetch appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      services (name, duration_minutes),
      clinics (name, address)
    `) // Add doctor/staff if available
    .eq('patient_id', session.patient_id)
    .order('start_time', { ascending: false })

  if (!appointments) return NextResponse.json({ upcoming: [], past: [] })

  const now = new Date()
  const upcoming = appointments.filter((a: any) => new Date(a.start_time) >= now && a.status !== 'cancelled')
  const past = appointments.filter((a: any) => new Date(a.start_time) < now || a.status === 'cancelled')

  return NextResponse.json({ upcoming, past })
}
