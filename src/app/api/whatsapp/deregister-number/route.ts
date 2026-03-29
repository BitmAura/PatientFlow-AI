import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WhatsAppProviderFactory } from '@/lib/whatsapp/provider-factory';
import { gupshupConfig } from '@/config/gupshup';

export async function POST(request: Request) {
  const supabase = createClient() as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  // 1. Get Clinic
  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single();

  if (!staff?.clinic_id) return new NextResponse('Clinic not found', { status: 404 });

  const clinicId = staff.clinic_id;

  // 2. Get Current Connection Details
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('session_data')
    .eq('clinic_id', clinicId)
    .single();

  const sessionData = (connection?.session_data || {}) as Record<string, any>;
  const phoneNumber =
    sessionData.phoneNumber ||
    sessionData.phone_number ||
    sessionData.verified_number ||
    sessionData.phoneNumberId ||
    '';

  // 3. Pause Automation (Immediate Safety)
  // Lock all active journeys to prevent further processing
  await supabase
    .from('patient_journeys')
    .update({ 
      automation_locked: true,
      automation_locked_at: new Date().toISOString()
    } as any)
    .eq('clinic_id', clinicId)
    .eq('status', 'active');

  // 4. Call Gupshup API to Deregister (via Provider)
  const provider = WhatsAppProviderFactory.getProvider('gupshup');
  
  try {
    if (phoneNumber) {
      await provider.deregisterNumber(phoneNumber, {
        apiKey: sessionData.apiKey || gupshupConfig.appToken,
        appId: sessionData.appId || gupshupConfig.appId,
      });
    }
  } catch (error) {
    console.error('[Deregister] Provider error:', error);
    // We continue even if provider fails, to ensure local state is updated and safe.
    // We might want to alert admin though.
  }

  // 5. Update Database State
  const { error } = await supabase
    .from('whatsapp_connections')
    .update({ 
      status: 'disconnected', 
      offboarded_at: new Date().toISOString(),
      offboarding_reason: 'User initiated deregistration via Dashboard',
      updated_at: new Date().toISOString(),
      // Clear sensitive session data to ensure no further usage
      session_data: {} 
    } as any)
    .eq('clinic_id', clinicId);

  if (error) {
    console.error('Failed to update DB during deregistration:', error);
    return new NextResponse('Failed to deregister', { status: 500 });
  }

  // 6. Return Confirmation
  return NextResponse.json({
    success: true,
    message: 'WhatsApp number deregistered and automation paused.',
    timestamp: new Date().toISOString()
  });
}
