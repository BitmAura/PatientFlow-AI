import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

export async function POST(
  request: Request,
  context: any
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
    .eq('id', context.params.id)
    .eq('clinic_id', staff.clinic_id)
    .single()

  if (!log) return new NextResponse('Log not found', { status: 404 })

  let phone = (log as any).phone
  if (!phone && (log as any).patient_id) {
    const { data: patient } = await supabase
      .from('patients')
      .select('phone')
      .eq('id', (log as any).patient_id)
      .single()
    phone = patient?.phone
  }

  if (!phone) {
    return new NextResponse('Patient phone not found for this reminder', { status: 400 })
  }

  const result = await sendWhatsAppMessage(
    (log as any).clinic_id,
    phone,
    (log as any).message,
    {
      type: (log as any).type || 'manual_resend',
      appointmentId: (log as any).appointment_id || null,
      patientId: (log as any).patient_id || null,
      resentFromLogId: (log as any).id,
    }
  )

  const { error } = await supabase
    .from('reminder_logs')
    .update({
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : result.error || 'Failed to resend',
      message_id: result.messageId || null,
    })
    .eq('id', context.params.id)

  if (error) return new NextResponse('Failed to resend', { status: 500 })

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error || 'Failed to resend' }, { status: 502 })
  }

  return NextResponse.json({ success: true, messageId: result.messageId || null })
}

