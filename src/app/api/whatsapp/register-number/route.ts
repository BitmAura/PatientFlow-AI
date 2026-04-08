import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerPhoneWithGupshup } from '@/lib/gupshup/service'
import { updateGupshupConfigStatus, saveGupshupConfig } from '@/services/gupshup/config'
import { logError } from '@/lib/logger'

/**
 * POST /api/whatsapp/register-number
 * 
 * Step 1: Initiate Gupshup phone registration
 * - Validates clinic ownership
 * - Calls Gupshup registration API
 * - Stores config with 'registering' status
 * - Returns request_id for next step
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient() as any
    const body = await req.json()
    const { phone_number } = body

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get clinic from user
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .single()

    if (!staff || staff.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Only clinic owners can configure WhatsApp' },
        { status: 403 }
      )
    }

    const clinicId = staff.clinic_id

    // 3. Validate phone number
    if (!phone_number) {
      return NextResponse.json(
        { success: false, error: 'phone_number is required' },
        { status: 400 }
      )
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone_number.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone format. Use +919988776655' },
        { status: 400 }
      )
    }

    // 4. Get Gupshup credentials from environment
    const gupshupAppId = process.env.GUPSHUP_APP_ID
    const gupshupApiKey = process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN

    if (!gupshupAppId || !gupshupApiKey) {
      console.error('[Register Phone] Gupshup credentials missing')
      return NextResponse.json(
        { success: false, error: 'WhatsApp service not configured' },
        { status: 500 }
      )
    }

    // 5. Call Gupshup registration API
    console.log('[Register Phone] Registering with Gupshup:', {
      clinic: clinicId,
      phone: phone_number.slice(-4),
    })

    const result = await registerPhoneWithGupshup({
      clinicId,
      phoneNumber: phone_number,
      appId: gupshupAppId,
      apiKey: gupshupApiKey,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Registration failed' },
        { status: 502 }
      )
    }

    // 6. Save config with 'registering' status
    try {
      await saveGupshupConfig(clinicId, {
        app_id: gupshupAppId,
        app_token: process.env.GUPSHUP_APP_TOKEN || '',
        api_key: gupshupApiKey,
        phone_number_id: phone_number,
        status: 'registering',
      })
    } catch (e) {
      console.error('[Register Phone] Failed to save config:', e)
      // Don't fail - user can still verify
    }

    console.log('[Register Phone] ✅ Registration initiated. Waiting for OTP.')

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your phone. Check SMS within 10 minutes.',
        phone_number: phone_number,
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[Register Phone] Error:', error)
    await logError('WhatsApp registration failed', error, { endpoint: '/api/whatsapp/register-number' })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
