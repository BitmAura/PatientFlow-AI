/**
 * Gupshup Configuration Service
 * 
 * Handles per-clinic Gupshup credential storage, retrieval, and validation
 */

import { createClient } from '@supabase/supabase-js'
import { registerPhoneWithGupshup, verifyPhoneOtpGupshup, getGupshupStatus } from '@/lib/gupshup/service'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface GupshupConfig {
  id: string
  clinic_id: string
  app_id: string
  app_token: string
  api_key: string
  phone_number_id: string
  status: 'pending' | 'registering' | 'verified' | 'active' | 'error'
  error_message?: string
  registered_at?: string
  verified_at?: string
  last_message_sent_at?: string
  created_at: string
  updated_at: string
}

/**
 * Get Gupshup config for a clinic
 */
export async function getGupshupConfig(clinicId: string): Promise<GupshupConfig | null> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gupshup_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found (expected if no config)
      throw error
    }

    return data || null
  } catch (error) {
    console.error('[Gupshup Service] Failed to get config:', error)
    throw error
  }
}

/**
 * Save Gupshup configuration after registration
 */
export async function saveGupshupConfig(
  clinicId: string,
  config: {
    app_id: string
    app_token: string
    api_key: string
    phone_number_id: string
    status?: 'pending' | 'registering' | 'verified' | 'active'
  }
): Promise<GupshupConfig> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gupshup_config')
      .upsert(
        {
          clinic_id: clinicId,
          app_id: config.app_id,
          app_token: config.app_token,
          api_key: config.api_key,
          phone_number_id: config.phone_number_id,
          status: config.status || 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clinic_id' }
      )
      .select()
      .single()

    if (error) throw error

    console.log('[Gupshup Service] ✅ Config saved:', {
      clinicId,
      phone_number_id: config.phone_number_id,
    })

    return data
  } catch (error) {
    console.error('[Gupshup Service] Failed to save config:', error)
    throw error
  }
}

/**
 * Update Gupshup config status
 */
export async function updateGupshupConfigStatus(
  clinicId: string,
  status: 'pending' | 'registering' | 'verified' | 'active' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (errorMessage) {
      updateData.error_message = errorMessage
      updateData.last_error_at = new Date().toISOString()
    }

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString()
    }

    if (status === 'active') {
      updateData.registered_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('gupshup_config')
      .update(updateData)
      .eq('clinic_id', clinicId)

    if (error) throw error

    console.log(`[Gupshup Service] Status updated: ${clinicId} → ${status}`)
  } catch (error) {
    console.error('[Gupshup Service] Failed to update status:', error)
    throw error
  }
}

/**
 * Mark message as sent (update last_message_sent_at)
 */
export async function updateLastMessageSent(clinicId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gupshup_config')
      .update({
        last_message_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('clinic_id', clinicId)

    if (error) throw error
  } catch (error) {
    console.error('[Gupshup Service] Failed to update last_message_sent_at:', error)
    // Don't throw - this is not critical
  }
}

/**
 * Mark webhook as received
 */
export async function updateLastWebhookReceived(clinicId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gupshup_config')
      .update({
        last_webhook_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('clinic_id', clinicId)

    if (error) throw error
  } catch (error) {
    console.error('[Gupshup Service] Failed to update last_webhook_received_at:', error)
  }
}

/**
 * Check if Gupshup is configured and active for clinic
 */
export async function isGupshupActive(clinicId: string): Promise<boolean> {
  try {
    const config = await getGupshupConfig(clinicId)
    return !!(config && config.status === 'active')
  } catch (error) {
    console.error('[Gupshup Service] Error checking if Gupshup active:', error)
    return false
  }
}

/**
 * Get all clinics with active Gupshup config
 */
export async function getActiveGupshupClinics(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('gupshup_config')
      .select('clinic_id')
      .eq('status', 'active')

    if (error) throw error

    return (data || []).map(item => item.clinic_id)
  } catch (error) {
    console.error('[Gupshup Service] Failed to get active clinics:', error)
    return []
  }
}

/**
 * Validate Gupshup credentials
 */
export async function validateGupshupCredentials(config: {
  app_id: string
  app_token: string
  api_key: string
  phone_number_id: string
}): Promise<{ valid: boolean; error?: string }> {
  try {
    // Test credentials with API
    const status = await getGupshupStatus(config.api_key)

    if (!status.healthy) {
      return {
        valid: false,
        error: `Gupshup API returned error: ${status.message}`,
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Get statistics for a clinic's Gupshup usage
 */
export async function getGupshupStats(clinicId: string): Promise<{
  messagesThisMonth: number
  successRate: number
  lastMessageAt: string | null
  daysActive: number
}> {
  try {
    const supabase = getSupabaseClient()
    const config = await getGupshupConfig(clinicId)
    if (!config) {
      return {
        messagesThisMonth: 0,
        successRate: 0,
        lastMessageAt: null,
        daysActive: 0,
      }
    }

    // Count messages this month
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: logs } = await supabase
      .from('communication_logs')
      .select('status')
      .eq('clinic_id', clinicId)
      .eq('channel', 'whatsapp')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const total = logs?.length || 0
    const successful = logs?.filter(l => l.status === 'delivered').length || 0
    const successRate = total > 0 ? (successful / total) * 100 : 0

    // Calculate days active
    const registeredAt = config.registered_at ? new Date(config.registered_at) : new Date(config.created_at)
    const now = new Date()
    const daysActive = Math.floor((now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      messagesThisMonth: total,
      successRate: Math.round(successRate),
      lastMessageAt: config.last_message_sent_at || null,
      daysActive: Math.max(daysActive, 0),
    }
  } catch (error) {
    console.error('[Gupshup Service] Failed to get stats:', error)
    return {
      messagesThisMonth: 0,
      successRate: 0,
      lastMessageAt: null,
      daysActive: 0,
    }
  }
}

/**
 * Delete Gupshup config (clinic disconnect)
 */
export async function deleteGupshupConfig(clinicId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('gupshup_config')
      .delete()
      .eq('clinic_id', clinicId)

    if (error) throw error

    console.log('[Gupshup Service] Deleted config for clinic:', clinicId)
  } catch (error) {
    console.error('[Gupshup Service] Failed to delete config:', error)
    throw error
  }
}
