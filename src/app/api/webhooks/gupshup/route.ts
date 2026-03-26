import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { WhatsAppProviderFactory } from '@/lib/whatsapp/provider-factory';
import { gupshupConfig } from '@/config/gupshup';
import { processIncomingJourneyMessage } from '@/lib/whatsapp/patient-journey';

/** Optional: verify webhook authenticity. Gupshup may send Authorization header or you can use a shared secret. */
function verifyGupshupWebhook(request: Request): boolean {
  const secret = process.env.GUPSHUP_WEBHOOK_SECRET;
  if (!secret) return true;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7) === secret;
  const appToken = request.headers.get('x-gupshup-token') ?? request.headers.get('x-app-token');
  return appToken === secret;
}

export async function POST(request: Request) {
  if (!verifyGupshupWebhook(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await request.json();
  const admin = createAdminClient();
  const provider = WhatsAppProviderFactory.getProvider('gupshup');

  try {
    // 2. Parse Incoming Message via Provider
    const messages = await provider.receiveMessage(payload);

    if (!messages || messages.length === 0) {
      // Could be a status update (sent/delivered/read)
      // Gupshup sends events like: { type: 'message-event', payload: { ... } }
      if (payload.type === 'message-event') {
        const event = payload.payload;
        if (event.id && event.status) {
           await admin
            .from('reminder_logs')
            .update({ status: event.status })
            .eq('message_id', event.id);
        }
      }
      return NextResponse.json({ received: true });
    }

    for (const msg of messages) {
      const fromPhone = msg.from; // e.g. 919876543210
      const content = typeof msg.content === 'string' ? msg.content.trim() : '';
      
      console.log(`[Gupshup Webhook] Received from ${fromPhone}: ${content}`);

      // 3. Find Clinic associated with this incoming number's DESTINATION
      // Gupshup payload usually has 'destination' (the clinic's number)
      // We need to match the clinic based on the 'destination' field in payload
      const clinicNumber = payload.payload?.destination; 
      
      if (!clinicNumber) {
        console.warn('Missing destination number in payload, cannot identify clinic');
        continue;
      }

      // Find clinic
      const { data: connection } = await admin
        .from('whatsapp_connections')
        .select('clinic_id, status')
        .contains('session_data', { phoneNumber: clinicNumber }) // Assuming we stored phone in session_data
        .single();

      if (!connection || !['connected', 'active'].includes(connection.status)) {
        console.warn(`Clinic not found or disconnected for number ${clinicNumber}`);
        continue;
      }

      const clinicId = connection.clinic_id;

      // 4. Handle OPT-OUT (STOP / NO / UNSUBSCRIBE)
      const upperText = content.toUpperCase();
      if (['STOP', 'NO', 'UNSUBSCRIBE'].includes(upperText)) {
        await handleOptOut(admin, clinicId, fromPhone);
        continue;
      }

      // 5. Handle Neutral / Pause (Ok, Later, Busy)
      if (['OK', 'LATER', 'BUSY', 'THUMBS UP', '👍'].some(k => upperText.includes(k))) {
        await pauseAutomation(admin, clinicId, fromPhone);
        continue;
      }

      await processIncomingJourneyMessage(admin as any, clinicId, fromPhone, content);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError('Gupshup webhook error', error, { path: '/api/webhooks/gupshup' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleOptOut(admin: any, clinicId: string, phone: string) {
  console.log(`[Opt-Out] Processing for ${phone} @ Clinic ${clinicId}`);
  
  // 1. Leads
  const { data: leads } = await admin
    .from('leads')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('phone', phone);

  if (leads?.length) {
    for (const lead of leads) {
      await admin.from('leads').update({ is_opted_out: true }).eq('id', lead.id);
      await admin.from('lead_activities').insert({
        lead_id: lead.id,
        type: 'opt_out',
        description: 'User replied STOP (Gupshup)',
        created_at: new Date().toISOString()
      });
    }
  }

  // 2. Patients
  const { data: patient } = await admin
    .from('patients')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .single();

  if (patient) {
    await admin.from('patients')
      .update({ lifecycle_stage: 'opted_out', whatsapp_opt_in: false })
      .eq('id', patient.id);
      
    // Cancel active recalls
    await admin.from('patient_recalls')
      .update({ status: 'cancelled', notes: 'User replied STOP' })
      .eq('patient_id', patient.id)
      .in('status', ['pending', 'overdue']);
  }
}

async function pauseAutomation(admin: any, clinicId: string, phone: string) {
  // Find active journey for this patient and lock it
  const { data: patient } = await admin
    .from('patients')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .single();

  if (patient) {
    await admin
      .from('patient_journeys')
      .update({ automation_locked: true, automation_locked_at: new Date().toISOString() })
      .eq('patient_id', patient.id)
      .eq('status', 'active');
      
    console.log(`[Pause] Automation locked for patient ${patient.id}`);
  }
}

