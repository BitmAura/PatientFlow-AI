import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertToAppointment } from '@/lib/services/followups'
import { convertFollowupSchema } from '@/lib/validations/followup'
import { writeAuditLog } from '@/lib/audit/log'

export async function POST(
  request: Request,
  context: any
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase.from('staff').select('clinic_id').eq('user_id', user.id).single()
  if (!(staff as any)?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  const body = await request.json()
  const validation = convertFollowupSchema.safeParse(body)

  if (!validation.success) {
    return new NextResponse('Invalid data', { status: 400 })
  }

  try {
    const appointmentData = {
      ...validation.data,
      clinic_id: (staff as any).clinic_id,
      created_by: user.id
    }
    const appointment = await convertToAppointment(context.params.id, appointmentData)

    await writeAuditLog({
      clinicId: (staff as any).clinic_id,
      userId: user.id,
      action: 'update',
      entityType: 'followup_conversion',
      entityId: context.params.id,
      newValues: {
        appointment_id: appointment.id,
        start_time: appointment.start_time,
      },
      request,
    })

    return NextResponse.json(appointment)
  } catch (error) {
    return new NextResponse('Failed to convert followup', { status: 500 })
  }
}
