import { createClient } from '@/lib/supabase/server'
import { GupshupProvider } from '@/lib/whatsapp/providers/gupshup-provider'
import { WhatsAppProviderConfig } from '@/lib/whatsapp/provider-interface'
import { parseWhatsAppSession, getApiKeyFromSession, getPhoneNumberIdFromSession } from '@/lib/whatsapp/session'
import { messageGuard, logBlockedMessage } from './message-guard'
import { SubscriptionGate } from '@/lib/subscription-gate'

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
  status: 'sent' | 'failed' | 'skipped'
  skippedReason?: string
}

export async function sendWhatsAppMessage(
  clinicId: string,
  phoneNumber: string,
  message: string,
  metadata?: {
    patientId?: string
    journeyId?: string
    type?: string
    isTemplate?: boolean
    templateName?: string
  }
): Promise<SendMessageResult> {
  const supabase = createClient() as any
  let patientId = metadata?.patientId
  
  try {
    // 1. Fetch Clinic Config (Shared Number vs Own Number)
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('use_shared_number, name')
      .eq('id', clinicId)
      .single()

    if (clinicError || !clinic) {
       return { success: false, status: 'failed', error: 'Clinic not found' }
    }

    // 2. Central Security Guard Check
    const guard = await messageGuard(clinicId, patientId ?? null, phoneNumber, (metadata?.type as any) || 'manual')
    if (!guard.allowed) {
      await logBlockedMessage(clinicId, patientId ?? null, phoneNumber, message, guard.reason!, metadata?.type || 'manual')
      return { 
        success: false, 
        status: 'skipped', 
        error: `Blocked by Guard: ${guard.reason}`,
        skippedReason: guard.reason 
      }
    }

    // 4. Check: Template approved (if applicable).
    if (metadata?.isTemplate && metadata?.templateName) {
      const templateName = metadata.templateName
      const { data: templateData, error: templateError } = await supabase
        .from('message_templates')
        .select('status')
        .eq('name', templateName)
        .eq('clinic_id', clinicId)
        .maybeSingle() as { data: { status?: string } | null; error: any }

      if (templateData?.status && templateData.status !== 'approved') {
        console.warn(`[WhatsApp] Skipped: Template ${templateName} not approved (${templateData.status})`)
        return {
          success: false,
          status: 'skipped',
          error: 'Template not approved',
          skippedReason: 'template_not_approved'
        }
      }

      // Fallback approval source: clinic reminder settings templates.
      if (!templateData) {
        const { data: reminderSettings } = await supabase
          .from('reminder_settings')
          .select('whatsapp_template_24h, whatsapp_template_2h')
          .eq('clinic_id', clinicId)
          .maybeSingle()

        const allowedTemplates = [
          reminderSettings?.whatsapp_template_24h,
          reminderSettings?.whatsapp_template_2h,
        ].filter(Boolean)

        if (allowedTemplates.length > 0 && !allowedTemplates.includes(templateName)) {
          return {
            success: false,
            status: 'skipped',
            error: 'Template not approved for clinic',
            skippedReason: 'template_not_approved'
          }
        }

        if (allowedTemplates.length === 0 && templateError) {
          console.warn('[WhatsApp] Skipped: Unable to verify template approval', templateError)
          return {
            success: false,
            status: 'skipped',
            error: 'Unable to verify template approval',
            skippedReason: 'template_verification_failed'
          }
        }
      }
    }

    let config: WhatsAppProviderConfig;

    if (clinic.use_shared_number) {
      // Use Global Shared Number (ENV vars)
      config = {
        apiKey: process.env.GUPSHUP_APP_TOKEN || '',
        appId: process.env.GUPSHUP_APP_ID || '',
        phoneNumberId: process.env.GUPSHUP_SOURCE_NUMBER || '',
        appName: process.env.GUPSHUP_APP_NAME || 'PatientFlowAI_Shared'
      }
    } else {
      // Use Custom Clinic Number credentials from connection
      const { data: connection, error: connectionError } = await supabase
        .from('whatsapp_connections')
        .select('session_data, status')
        .eq('clinic_id', clinicId)
        .single()

      if (connectionError || !connection || connection.status !== 'active') {
        return { 
          success: false, 
          status: 'skipped', 
          error: 'WhatsApp not active',
          skippedReason: 'whatsapp_inactive' 
        }
      }

      const connSession = parseWhatsAppSession(connection.session_data)
      config = {
        apiKey: getApiKeyFromSession(connSession) || '',
        appId: connSession?.appId || '',
        phoneNumberId: getPhoneNumberIdFromSession(connSession) || '',
        appName: connSession?.appName || ''
      }
    }

    if (!config.apiKey || !config.phoneNumberId) {
      return { success: false, status: 'failed', error: 'Missing WhatsApp credentials' }
    }

    // 5. Call Gupshup send message API
    const provider = new GupshupProvider()
    const result = await provider.sendMessage(phoneNumber, {
      type: 'text',
      content: clinic.use_shared_number 
        ? `Hi, this is ${clinic.name} reminding you: ${message}` 
        : message
    }, config)

    if (!result.success) {
      throw new Error(result.error || 'Gupshup send failed')
    }

    // 6. Increment Usage Counter
    await SubscriptionGate.incrementUsage(supabase, clinicId, 'message')

    // 6. Store: message_id, status, timestamp
    if (patientId) {
      const { error: logError } = await supabase.from('reminder_logs').insert({
        clinic_id: clinicId,
        patient_id: patientId,
        appointment_id: null, // We don't have appointment_id in generic send
        phone: phoneNumber,
        message: message, // Schema has `message` column
        type: metadata?.type || 'manual',
        status: 'sent',
        message_id: result.messageId,
        created_at: new Date().toISOString()
      } as any)

      if (logError) {
        console.error('[WhatsApp] Failed to log message:', logError)
      }
    }

    return {
      success: true,
      messageId: result.messageId,
      status: 'sent'
    }

  } catch (error: any) {
    console.error('[WhatsApp] Send failed:', error)

    // Log failure
    if (patientId) {
      await supabase.from('reminder_logs').insert({
        clinic_id: clinicId,
        patient_id: patientId,
        appointment_id: null,
        phone: phoneNumber,
        message: message,
        type: metadata?.type || 'manual',
        status: 'failed',
        error: error.message,
        created_at: new Date().toISOString()
      } as any)
    }

    return {
      success: false,
      status: 'failed',
      error: error.message
    }
  }
}
