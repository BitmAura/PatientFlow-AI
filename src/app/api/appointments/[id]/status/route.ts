import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { statusUpdateSchema } from '@/lib/validations/appointment'
import { ALLOWED_TRANSITIONS, AppointmentStatus } from '@/constants/appointment-status'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const result = statusUpdateSchema.safeParse(body)

  if (!result.success) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  const { status, reason } = result.data
  const supabase = createClient()

  // Get current appointment status
  const { data: currentAppt } = await supabase
    .from('appointments')
    .select('status, clinic_id')
    .eq('id', params.id)
    .single()

  if (!currentAppt) return new NextResponse('Appointment not found', { status: 404 })

  // Validate Transition
  const allowed = ALLOWED_TRANSITIONS[(currentAppt as any).status as AppointmentStatus]
  if (!allowed.includes(status as AppointmentStatus)) {
    return new NextResponse(`Cannot transition from ${(currentAppt as any).status} to ${status}`, { status: 400 })
  }

  // Update - cast to any to bypass TypeScript strict checking
  const { data, error } = await (supabase as any)
    .from('appointments')
    .update({ 
      status,
      internal_notes: reason ? `Status changed to ${status}: ${reason}` : undefined 
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return new NextResponse('Failed to update status', { status: 500 })
  }

  return NextResponse.json(data)
}