import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGupshupStatus } from '@/lib/gupshup/service'
import { saveGupshupConfig } from '@/services/gupshup/config'
import { logError } from '@/lib/logger'

/**
 * POST /api/whatsapp/connect
 * 
 * Manual setup: Connect existing WhatsApp/Gupshup credentials
 * - Validates credentials against Gupshup API
 * - Stores credentials in database
 * - Updates config status to 'active'
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
    const { provider, app_id, api_key, phone_number_id } = body

    // Validate input
    if (!provider || !api_key || !phone_number_id) {
      return NextResponse.json(
        { success: false, error: 'provider, api_key, and phone_number_id are required' },
        { status: 400 }
      )
    }

    if (provider !== 'gupshup') {
      return NextResponse.json(
        { success: false, error: 'Only Gupshup provider is supported for manual setup' },
        { status: 400 }
      )
    }

    // Validate Gupshup credentials
    console.log('[Connect] Validating Gupshup credentials...')

    const status = await getGupshupStatus(api_key)
    if (!status.healthy) {
      return NextResponse.json(
        { success: false, error: `Invalid Gupshup API key: ${status.message}` },
        { status: 400 }
      )
    }

    // Save to database
    try {
      await saveGupshupConfig(clinicId, {
        app_id: app_id || 'manual-setup',
        app_token: '',
        api_key,
        phone_number_id,
        status: 'active',
      })
    } catch (e) {
      console.error('[Connect] Failed to save config:', e)
      return NextResponse.json(
        { success: false, error: 'Failed to save credentials. Try again.' },
        { status: 500 }
      )
    }

    console.log('[Connect] ✅ Gupshup credentials verified and saved.')

    return NextResponse.json(
      {
        success: true,
        message: 'WhatsApp is now connected to Gupshup!',
        phone_number_id,
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[Connect] Error:', error)
    await logError('WhatsApp connect failed', error, { endpoint: '/api/whatsapp/connect' })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
