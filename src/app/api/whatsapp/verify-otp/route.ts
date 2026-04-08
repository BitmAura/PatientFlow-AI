import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPhoneOtpGupshup } from '@/lib/gupshup/service'
import { updateGupshupConfigStatus } from '@/services/gupshup/config'
import { logError } from '@/lib/logger'

/**
 * POST /api/whatsapp/verify-otp
 * 
 * Step 2: Verify OTP and complete phone registration
 * - Validates OTP from user input
 * - Calls Gupshup OTP verification API
 * - Updates config status to 'verified'
 * - Returns phone_number_id for messaging
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    const body = await request.json()
    const { phone_number, otp } = body

    // Validate input
    if (!phone_number || !otp) {
      return NextResponse.json(
        { success: false, error: 'phone_number and otp are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be 6 digits' },
        { status: 400 }
      )
    }

    // Get Gupshup credentials
    const gupshupAppId = process.env.GUPSHUP_APP_ID
    const gupshupApiKey = process.env.GUPSHUP_API_KEY || process.env.GUPSHUP_APP_TOKEN

    if (!gupshupAppId || !gupshupApiKey) {
      console.error('[Verify OTP] Gupshup credentials missing')
      return NextResponse.json(
        { success: false, error: 'WhatsApp service not configured' },
        { status: 500 }
      )
    }

    // Call Gupshup OTP verification
    console.log('[Verify OTP] Verifying OTP for:', {
      clinic: clinicId,
      phone: phone_number.slice(-4),
    })

    const result = await verifyPhoneOtpGupshup({
      clinicId,
      phoneNumber: phone_number,
      otp,
      appId: gupshupAppId,
      apiKey: gupshupApiKey,
    })

    if (!result.success) {
      try {
        await updateGupshupConfigStatus(clinicId, 'error', result.error)
      } catch (e) {
        console.warn('[Verify OTP] Could not update status:', e)
      }

      return NextResponse.json(
        { success: false, error: result.error || 'OTP verification failed' },
        { status: 400 }
      )
    }

    // Update config status to 'verified'
    try {
      await updateGupshupConfigStatus(clinicId, 'verified')
    } catch (e) {
      console.error('[Verify OTP] Failed to update status:', e)
    }

    console.log('[Verify OTP] ✅ Phone verified. Ready to send messages.')

    return NextResponse.json(
      {
        success: true,
        message: 'WhatsApp number verified and activated',
        phone_number_id: result.numberId,
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[Verify OTP] Error:', error)
    await logError('OTP verification failed', error, { endpoint: '/api/whatsapp/verify-otp' })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
