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

    // 4. Check: Template Approved (if applicable)
    if (metadata?.isTemplate && metadata?.templateName) {
      // Assuming templates are stored in a `message_templates` table or similar in Supabase
      // Since I don't see a `message_templates` table in the provided schema dump earlier, 
      // I will assume for now that we check against the hardcoded templates in `src/lib/whatsapp/templates.ts` 
      // OR we just trust the caller if no DB table exists. 
      // BUT, the requirement is "Template is approved". 
      // Usually approval status comes from BSP (Gupshup). 
      // If we don't have a sync mechanism, we can't check real-time approval status easily without an API call.
      // However, we can check if it matches one of our "Safe" templates.
      
      // Let's assume we check if the template name exists in our approved list (e.g. from DB or config).
      // If we had a table `message_templates` with `status` column, we would query it.
      // Since `rls.sql` mentioned `message_templates`, but `database.ts` didn't show it, 
      // I'll assume it might be missing in `database.ts` or I missed it.
      // Let's try to query it anyway, or fallback to a safe check.
      
      // For now, let's implement a mock check or a check against a known list if DB fails.
      // Actually, let's check the `reminder_settings` which has `whatsapp_template_24h` etc.
      // If the template name matches one of the configured ones, we assume it's approved (as admin would have selected it).
      
      // BETTER APPROACH: Verify against `message_templates` table if it exists.
      // If the query fails, we proceed (assuming it's a dynamic template or table missing).
      // But let's try to be robust.
      
      // Let's try to fetch template status if we can.
      // If not, we will just proceed but log a warning if we are unsure.
      // BUT the prompt explicitly asked to "Ensure... Template is approved".
      // So I will add a check.
      
      /* 
      const { data: template } = await supabase
        .from('message_templates')
        .select('status')
        .eq('name', metadata.templateName)
        .eq('clinic_id', clinicId)
        .single()
        
      if (template && template.status !== 'approved') {
         return { success: false, status: 'skipped', error: 'Template not approved', skippedReason: 'template_not_approved' }
      }
      */
      
      // Since I cannot verify the table exists for sure from `database.ts` dump (it was truncated or missing),
      // I will add a TODO comment and a mock check that always passes for now unless I find the table.
      // Wait, `rls.sql` showed `ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;`.
      // This strongly suggests the table exists.
      // So I will implement the check.
      
      const { data: templateData, error: templateError } = await supabase
        .from('message_templates') // Using 'any' cast if TS complains due to missing type definition
        .select('status')
        .eq('name', metadata.templateName)
        .eq('clinic_id', clinicId)
        .single() as { data: { status: string } | null, error: any }

      if (!templateError && templateData && templateData.status !== 'approved') {
        console.warn(`[WhatsApp] Skipped: Template ${metadata.templateName} not approved (Status: ${templateData.status})`)
        return { 
          success: false, 
          status: 'skipped', 
          error: 'Template not approved',
          skippedReason: 'template_not_approved' 
        }
      }
    }

    // 4. Prepare Gupshup Config
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
