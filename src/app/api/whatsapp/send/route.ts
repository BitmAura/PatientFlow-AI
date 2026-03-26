import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

export async function POST(request: Request) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 })

  try {
    const { phone, message } = await request.json()
    if (!phone || !message) return new NextResponse('Missing phone or message', { status: 400 })

    const result = await sendWhatsAppMessage(staff.clinic_id, phone, message, { type: 'manual_test' })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}