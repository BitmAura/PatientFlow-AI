import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rescheduleSchema } from '@/lib/validations/appointment'
import { addMinutes } from 'date-fns'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const result = rescheduleSchema.safeParse({
    ...body,
    new_date: new Date(body.new_date)
  })

  if (!result.success) {
    return new NextResponse('Invalid request', { status: 400 })
  }

  const { new_date, new_time, reason } = result.data
  const supabase = createClient()

  // 1. Get Original Appointment
  const { data: original } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!original) return new NextResponse('Appointment not found', { status: 404 })

  // 2. Calculate New Times
  const [hours, minutes] = new_time.split(':').map(Number)
  const startTime = new Date(new_date)
  startTime.setHours(hours, minutes, 0, 0)
  const endTime = addMinutes(startTime, (original as any).duration)

  // 3. Check for conflicts manually
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', (original as any).doctor_id)
    .neq('id', (original as any).id)
    .or(`and(start_time.lte.${startTime.toISOString()},end_time.gt.${startTime.toISOString()}),and(start_time.lt.${endTime.toISOString()},end_time.gte.${endTime.toISOString()})`)

  if (conflicts && conflicts.length > 0) {
    return new NextResponse('Time slot conflict detected', { status: 409 })
  }

  // 4. Update appointment - cast the entire operation to any
  const { error } = await (supabase as any)
    .from('appointments')
    .update({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed'
    })
    .eq('id', params.id)

  if (error) {
    return new NextResponse('Failed to reschedule', { status: 500 })
  }

  return NextResponse.json({ success: true })
}