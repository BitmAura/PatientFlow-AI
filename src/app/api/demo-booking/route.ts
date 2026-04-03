import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message'
import { sendEmail } from '@/lib/email'

interface DemoBookingPayload {
  name?: string
  clinicName?: string
  phone?: string
  monthlyAppointments?: string
}

function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DemoBookingPayload

    const name = body.name?.trim() || ''
    const clinicName = body.clinicName?.trim() || ''
    const monthlyAppointments = body.monthlyAppointments?.trim() || ''
    const rawPhone = body.phone?.trim() || ''
    const phone = normalizePhone(rawPhone)

    if (!name || !clinicName || !monthlyAppointments || !rawPhone) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
    }

    const clinicId = process.env.DEMO_BOOKING_CLINIC_ID
    let waResult = { success: false }

    if (clinicId) {
      // Full path: save lead + send WhatsApp confirmation
      const supabase = createAdminClient() as any
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          clinic_id: clinicId,
          full_name: name,
          phone,
          source: 'website',
          status: 'new',
          interest: 'demo_booking',
          notes: `Clinic: ${clinicName}; Monthly Appts: ${monthlyAppointments}`,
          followup_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (lead) {
        const autoMessage = `Hi ${name}, thanks for requesting a PatientFlow AI demo for ${clinicName}. Our team will WhatsApp you shortly to confirm your slot!`
        waResult = await sendWhatsAppMessage(clinicId, phone, autoMessage, {
          type: 'demo_booking',
          leadId: lead.id,
        })
      }
    }

    // Always notify the founder via email so no lead is ever lost
    const founderEmail = process.env.DEMO_NOTIFY_EMAIL || process.env.EMAIL_FROM
    if (founderEmail) {
      await sendEmail({
        to: founderEmail.replace(/.*<(.+)>/, '$1').trim() || founderEmail,
        subject: `New demo request — ${clinicName} (${monthlyAppointments} appts/mo)`,
        html: `
          <h2>New Demo Request</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Clinic</td><td style="padding:8px">${clinicName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone (WhatsApp)</td><td style="padding:8px">${rawPhone}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Monthly Appointments</td><td style="padding:8px">${monthlyAppointments}</td></tr>
          </table>
          <p style="margin-top:16px">
            <a href="https://wa.me/${phone}" style="background:#25D366;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
              WhatsApp ${name} now
            </a>
          </p>
        `,
      }).catch(() => { /* non-critical */ })
    }

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
