import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'

interface DemoBookingPayload {
  name?: string
  clinicName?: string
  phone?: string
  city?: string
}

function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DemoBookingPayload

    const name = body.name?.trim() || ''
    const clinicName = body.clinicName?.trim() || ''
    const city = body.city?.trim() || ''
    const rawPhone = body.phone?.trim() || ''
    const phone = normalizePhone(rawPhone)

    if (!name || !clinicName || !city || !rawPhone) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
    }

    const clinicId = process.env.DEMO_BOOKING_CLINIC_ID
    if (!clinicId) {
      return NextResponse.json(
        { error: 'Demo booking is not configured. Add DEMO_BOOKING_CLINIC_ID.' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient() as any
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        clinic_id: clinicId,
        full_name: name,
        phone,
        source: 'website',
        status: 'new',
        interest: 'demo_booking',
        notes: `Clinic Name: ${clinicName}; City: ${city}`,
        followup_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 })
    }

    const autoMessage = "Hi, thanks for booking demo. Here's how PatientFlow AI works..."
    const waResult = await sendWhatsAppMessage(clinicId, phone, autoMessage, {
      type: 'demo_booking',
      leadId: lead.id,
    })

    const calendarUrl = process.env.NEXT_PUBLIC_DEMO_CALENDAR_URL || null

    return NextResponse.json({
      success: true,
      whatsappSent: waResult.success,
      calendarUrl,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
