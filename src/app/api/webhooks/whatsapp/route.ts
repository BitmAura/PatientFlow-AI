import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const payload = await request.json()
  const admin = createAdminClient()

  try {
    const entries = payload?.entry || []

    for (const entry of entries) {
      const changes = entry?.changes || []
      for (const change of changes) {
        const statuses = change?.value?.statuses || []
        for (const status of statuses) {
          const messageId = status?.id
          const state = status?.status

          if (!messageId || !state) continue

          await admin
            .from('reminder_logs')
            .update({ status: state })
            .eq('message_id', messageId)
        }

        // Handle Incoming Messages
        const value = change?.value
        const messages = value?.messages || []
        if (messages.length > 0) {
          const phoneNumberId = value?.metadata?.phone_number_id
          if (phoneNumberId) {
            // Find clinic associated with this phone number
            const { data: connection } = await admin
              .from('whatsapp_connections')
              .select('clinic_id, status')
              .contains('session_data', { phone_number_id: phoneNumberId })
              .single()

            if (connection?.clinic_id) {
              const allowedStatuses = ['connected', 'active'];
              if (!allowedStatuses.includes(connection.status)) {
                console.warn(`[Webhook] Ignoring message for disconnected/paused clinic ${connection.clinic_id}. Status: ${connection.status}`);
                continue; // Skip this message
              }

              for (const message of messages) {
                // Check for STOP keyword
                if (message.type === 'text' && message.text?.body?.trim().toUpperCase() === 'STOP') {
                  const from = message.from // User's phone number (usually digits only)
                  const clinicId = connection.clinic_id

                  console.log(`Processing STOP request from ${from} for clinic ${clinicId}`)

                  // 1. Handle Leads
                  // We try to match phone as-is. 
                  // TODO: If DB has +, we might need to handle that. 
                  const { data: leads } = await admin
                    .from('leads')
                    .select('id')
                    .eq('clinic_id', clinicId)
                    .eq('phone', from)

                  if (leads && leads.length > 0) {
                    for (const lead of leads) {
                      await admin
                        .from('leads')
                        .update({ is_opted_out: true, next_followup_at: null })
                        .eq('id', lead.id)

                      await admin.from('lead_activities').insert({
                        lead_id: lead.id,
                        type: 'opt_out',
                        description: 'User replied STOP (Webhook)',
                        created_at: new Date().toISOString()
                      })
                    }
                  }

                  // 2. Handle Patients
                  const { data: patient } = await admin
                    .from('patients')
                    .select('id')
                    .eq('clinic_id', clinicId)
                    .eq('phone', from)
                    .single()

                  if (patient) {
                    await admin
                      .from('patients')
                      .update({ lifecycle_stage: 'opted_out', whatsapp_opt_in: false })
                      .eq('id', patient.id)

                    // Cancel Recalls
                    await admin
                      .from('patient_recalls')
                      .update({ status: 'cancelled', notes: 'User replied STOP (Webhook)' })
                      .eq('patient_id', patient.id)
                      .in('status', ['pending', 'overdue'])
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
  }

  return NextResponse.json({ received: true })
}
