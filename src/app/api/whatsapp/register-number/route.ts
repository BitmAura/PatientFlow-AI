import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyNumber } from '@/services/messaging';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient() as any;
    const body = await req.json();
    const { phone_number } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    const clinicId = staff?.clinic_id;

    // 1. Validate Input
    if (!phone_number || !clinicId) {
      return NextResponse.json(
        { error: 'Missing required fields: phone_number and authenticated clinic scope' },
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

    // 2. Initiate verification using provider-agnostic messaging service
    const result = await verifyNumber({
      clinicId,
      phoneNumber: phone_number,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to initiate verification' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration initiated. OTP sent to phone number.',
      status: result.status,
      provider: result.provider
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
