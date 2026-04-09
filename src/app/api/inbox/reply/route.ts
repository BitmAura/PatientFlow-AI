import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

/**
 * POST /api/inbox/reply
 * Staff replies to an incoming patient message via WhatsApp.
 * Body: { message_id: string, text: string }
 */
export async function POST(req: NextRequest) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff) return NextResponse.json({ error: 'Clinic not found' }, { status: 403 })

  const body = await req.json()
  const { message_id, text } = body

  if (!message_id || !text?.trim()) {
    return NextResponse.json({ error: 'message_id and text are required' }, { status: 400 })
  }

  if (text.trim().length > 4096) {
    return NextResponse.json({ error: 'Message too long (max 4096 characters)' }, { status: 400 })
  }

  // Fetch the original message to get patient phone
  const { data: original } = await supabase
    .from('patient_messages')
    .select('id, phone_number, clinic_id, patient_id')
    .eq('id', message_id)
    .eq('clinic_id', staff.clinic_id)
    .single()

  if (!original) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  // Send WhatsApp reply
  const result = await sendWhatsAppMessage(
    original.clinic_id,
    original.phone_number,
    text.trim(),
    { type: 'staff_reply', patientId: original.patient_id ?? undefined }
  )

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Failed to send message' }, { status: 500 })
  }

  // Mark original message as processed
  await supabase
    .from('patient_messages')
    .update({ status: 'processed', processed_at: new Date().toISOString() })
    .eq('id', message_id)

  return NextResponse.json({ success: true })
}
