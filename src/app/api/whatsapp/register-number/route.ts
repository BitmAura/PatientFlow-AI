import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WhatsAppProviderFactory } from '@/lib/whatsapp/provider-factory';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient() as any;
    const body = await req.json();
    const { phone_number, clinic_id, clinic_name, logo_url } = body;

    // 1. Validate Input
    if (!phone_number || !clinic_id) {
      return NextResponse.json(
        { error: 'Missing required fields: phone_number, clinic_id' },
        { status: 400 }
      );
    }

    // Basic Phone Validation (E.164 format roughly)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 (e.g., +919999999999)' },
        { status: 400 }
      );
    }

    // 2. Fetch Gupshup Config (from Env or Settings)
    // For now, using Env vars as default partner config
    const config = {
      apiKey: process.env.GUPSHUP_API_KEY || 'mock_key',
      appId: process.env.GUPSHUP_APP_ID || 'mock_app_id',
      appName: clinic_name || 'AuraRecall'
    };

    // 3. Initiate Registration (Call Gupshup API)
    const provider = WhatsAppProviderFactory.getProvider('gupshup');
    const result = await provider.registerNumber(phone_number, config);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to initiate registration with Gupshup', details: result.providerData },
        { status: 502 }
      );
    }

    // 4. Store in Database
    // Map 'pending_verification' to 'connecting' as per DB Enum
    const dbStatus = result.status === 'pending_verification' ? 'connecting' : 'disconnected';

    // Upsert connection
    const { error: dbError } = await supabase
      .from('whatsapp_connections')
      .upsert({
        clinic_id,
        status: dbStatus,
        session_data: {
          phone_number,
          clinic_name,
          logo_url,
          provider_status: result.status, // 'pending_verification'
          ...result.providerData
        },
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save connection status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration initiated. OTP sent to phone number.',
      status: result.status,
      data: result.providerData
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
