import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WhatsAppProviderFactory } from '@/lib/whatsapp/provider-factory'

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

  const body = await request.json()
  const { phone_number, otp } = body

  if (!phone_number || !otp) {
    return new NextResponse('Phone number and OTP are required', { status: 400 })
  }

  // 1. Get current connection to check context/config if needed
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('clinic_id', staff.clinic_id)
    .single()

  // 2. Prepare Config (In a real app, API Key comes from Env or secure storage)
  // We use the factory to get the provider
  const provider = WhatsAppProviderFactory.getProvider('gupshup')
  
  const config = {
    apiKey: process.env.GUPSHUP_API_KEY || 'mock_key',
    appId: process.env.GUPSHUP_APP_ID || 'mock_app_id',
    ...((connection?.session_data as object) || {})
  }

  // 3. Verify OTP
  const result = await provider.verifyOtp(phone_number, otp, config)

  if (result.success) {
    // 4. Update Status on Success – store doctor's number as source for sending (messages FROM this number TO leads/patients)
    const sessionData = {
      ...(connection?.session_data as object),
      provider: 'gupshup',
      verified_at: new Date().toISOString(),
      verified_number: phone_number,
      phoneNumberId: phone_number.replace(/\D/g, ''),
      apiKey: process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN,
      appId: process.env.GUPSHUP_APP_ID,
      appName: (connection?.session_data as any)?.clinic_name || 'AuraRecall',
      ...result.providerData
    }

    const { error } = await supabase
      .from('whatsapp_connections')
      .upsert({
        clinic_id: staff.clinic_id,
        status: 'active', // Set to active
        session_data: sessionData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'clinic_id' })

    if (error) {
      console.error('Failed to update whatsapp status', error)
      return new NextResponse('Verification successful but failed to update status', { status: 500 })
    }

    // "Lock normal WhatsApp usage" is implied by status='active' and provider switch
    
    return NextResponse.json({
      success: true,
      status: 'active',
      message: 'WhatsApp number verified and activated'
    })
  } else {
    // 5. Failure Flow
    return NextResponse.json({
      success: false,
      error: result.providerData?.error || 'OTP Verification Failed',
      message: 'Invalid OTP or expired'
    }, { status: 400 })
  }
}
