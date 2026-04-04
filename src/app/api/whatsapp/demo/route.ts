import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

/**
 * Public API for WhatsApp Live Demo
 * 🚀 Activated by: CEO/Founder Persona
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const supabase = createAdminClient() as any
    
    // 1. Find the "Demo Clinic" (Default to a specific known ID or the first one)
    const { data: demoClinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single()

    if (!demoClinic) {
      return NextResponse.json({ error: 'Demo clinic not configured' }, { status: 500 })
    }

    // 2. Trigger the WhatsApp Message (Mocking a Lead Conversion)
    // We use a bypass-safe internal call if needed, or ensure the demo clinic has a valid connection.
    const result = await sendWhatsAppMessage(
      demoClinic.id,
      phone,
      {
        name: 'demo_intro_v1',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'Future Clinic Partner' }
            ]
          }
        ]
      },
      { type: 'public_demo' }
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Demo message sent! Check your WhatsApp.',
      messageId: result.messageId
    })

  } catch (error: any) {
    console.error('Demo API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
