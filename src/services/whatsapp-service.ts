import { createClient } from '@/lib/supabase/server'
import { GupshupProvider } from '@/lib/whatsapp/providers/gupshup-provider'
import { WhatsAppProviderConfig } from '@/lib/whatsapp/provider-interface'

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
    // 1. Check: whatsapp_status = active
    const { data: connection, error: connectionError } = await supabase
      .from('whatsapp_connections')
      .select('status, session_data')
      .eq('clinic_id', clinicId)
      .single()

    if (connectionError || !connection || connection.status !== 'active') {
      console.warn(`[WhatsApp] Skipped: Clinic ${clinicId} WhatsApp not active`)
      return { 
        success: false, 
        status: 'skipped', 
        error: 'WhatsApp not active',
        skippedReason: 'whatsapp_inactive' 
      }
    }

    // 2. Check: automation not locked (Global Journey Lock)
    // If no patientId provided, try to find one by phone number
    if (!patientId) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('phone', phoneNumber) // Assumes exact match, might need normalization
        .single()
      
      if (patient) {
        patientId = patient.id
      }
    }

    // If we have a patientId, check if they have a locked journey
    if (patientId) {
      const { data: journey } = await supabase
        .from('patient_journeys')
        .select('automation_locked')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single()

      if (journey?.automation_locked) {
        console.warn(`[WhatsApp] Skipped: Patient ${patientId} automation locked`)
        return { 
          success: false, 
          status: 'skipped', 
          error: 'Automation locked',
          skippedReason: 'automation_locked' 
        }
      }
    } else {
       console.warn(`[WhatsApp] Warning: No patient found for ${phoneNumber}`)
    }

    // 3. Check: business hours (9 AM - 9 PM)
    const now = new Date()
    const currentHour = now.getHours()
    if (currentHour < 9 || currentHour >= 21) {
      console.warn(`[WhatsApp] Skipped: Outside business hours (${currentHour}:00)`)
      return { 
        success: false, 
        status: 'skipped', 
        error: 'Outside business hours',
        skippedReason: 'outside_business_hours' 
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

    // 5. Prepare Gupshup Config
    // session_data should contain apiKey, appId, etc.
    const config: WhatsAppProviderConfig = {
      apiKey: (connection.session_data as any).apiKey,
      appId: (connection.session_data as any).appId,
      phoneNumberId: (connection.session_data as any).phoneNumberId,
      appName: (connection.session_data as any).appName,
    }

    if (!config.apiKey || !config.phoneNumberId) {
      throw new Error('Missing Gupshup credentials in session_data')
    }

    // 5. Call Gupshup send message API
    const provider = new GupshupProvider()
    const result = await provider.sendMessage(phoneNumber, {
      type: 'text',
      content: message
    }, config)

    if (!result.success) {
      throw new Error(result.error || 'Gupshup send failed')
    }

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
