import { createClient } from '@/lib/supabase/server'
import { GupshupProvider } from '@/lib/whatsapp/providers/gupshup-provider'
import { WhatsAppProviderConfig } from '@/lib/whatsapp/provider-interface'
import { parseWhatsAppSession, getApiKeyFromSession, getPhoneNumberIdFromSession } from '@/lib/whatsapp/session'
import { messageGuard, logBlockedMessage } from './message-guard'
import { SubscriptionGate } from '@/lib/subscription-gate'
import { isWithinSessionWindow } from '@/lib/whatsapp/session-utils'

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
    variables?: any[]
  }
): Promise<SendMessageResult> {
  const supabase = createClient() as any
  let patientId = metadata?.patientId
  
  // 0. Initialize Queue Entry (Queue-First Model)
  const { data: queueEntry, error: queueError } = await supabase.from('message_queue').insert({
    clinic_id: clinicId,
    patient_id: patientId,
    phone: phoneNumber,
    message_body: message,
    message_type: metadata?.type || 'manual',
    status: 'pending',
    attempts: 0
  }).select('id').single()

  if (queueError) {
    console.error('[WhatsApp] Queue insert failed:', queueError)
  }

  try {
    // 1. Fetch Clinic Config
    const { data: clinic } = await supabase
      .from('clinics')
      .select('use_shared_number, name')
      .eq('id', clinicId)
      .single()

    if (!clinic) return { success: false, status: 'failed', error: 'Clinic not found' }

    // 2. Central Guard Check
    const guard = await messageGuard(clinicId, patientId ?? null, phoneNumber, (metadata?.type as any) || 'manual')
    if (!guard.allowed) {
      await logBlockedMessage(clinicId, patientId ?? null, phoneNumber, message, guard.reason!, metadata?.type || 'manual')
      if (queueEntry) await supabase.from('message_queue').update({ status: 'failed', error_log: [{ reason: guard.reason, at: new Date().toISOString() }] }).eq('id', queueEntry.id)
      return { success: false, status: 'skipped', error: `Blocked by Guard: ${guard.reason}`, skippedReason: guard.reason }
    }

    // 2.1 TRAI DND Check (For Marketing/Recall in India)
    if (metadata?.type === 'recall' || metadata?.type === 'marketing') {
      const { checkDndStatus } = await import('@/lib/compliance/trai-dnd')
      const dndStatus = await checkDndStatus(phoneNumber)
      if (dndStatus.isDnd) {
         await logBlockedMessage(clinicId, patientId ?? null, phoneNumber, message, 'opted_out' as any, metadata?.type)
         if (queueEntry) await supabase.from('message_queue').update({ status: 'failed', error_log: [{ reason: 'dnd_blocked', at: new Date().toISOString() }] }).eq('id', queueEntry.id)
         return { success: false, status: 'skipped', error: 'Blocked by TRAI DND Registry', skippedReason: 'opted_out' }
      }
    }

    // 3. SESSION WINDOW & TEMPLATE ENFORCEMENT
    const sessionOpen = await isWithinSessionWindow(clinicId, phoneNumber)
    let sendType: 'text' | 'template' = 'text'
    let templateData: any = null

    if (!sessionOpen && (metadata?.type !== 'manual')) {
      // Out of session - MUST use template
      const templateName = metadata?.templateName || `${metadata?.type}_v1`
      const { data: tpl } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('name', templateName)
        .eq('meta_status', 'APPROVED')
        .maybeSingle()

      if (!tpl) {
        if (queueEntry) await supabase.from('message_queue').update({ status: 'pending', error_log: [{ error: 'No approved template found for out-of-session message', at: new Date().toISOString() }] }).eq('id', queueEntry.id)
        return { success: false, status: 'skipped', error: 'Template required but not found/approved', skippedReason: 'template_not_found' }
      }
      
      sendType = 'template'
      templateData = tpl
    }

    // 4. Resolve Provider Config
    let config: WhatsAppProviderConfig;
    if (clinic.use_shared_number) {
      config = {
        apiKey: process.env.GUPSHUP_APP_TOKEN || '',
        appId: process.env.GUPSHUP_APP_ID || '',
        phoneNumberId: process.env.GUPSHUP_SOURCE_NUMBER || '',
        appName: process.env.GUPSHUP_APP_NAME || 'PatientFlowAI_Shared'
      }
    } else {
      const { data: connection } = await supabase.from('whatsapp_connections').select('session_data, status').eq('clinic_id', clinicId).single()
      if (!connection || connection.status !== 'active') return { success: false, status: 'skipped', error: 'WhatsApp not active' }
      const connSession = parseWhatsAppSession(connection.session_data)
      config = {
        apiKey: getApiKeyFromSession(connSession) || '',
        appId: connSession?.appId || '',
        phoneNumberId: getPhoneNumberIdFromSession(connSession) || '',
        appName: connSession?.appName || ''
      }
    }

    // 5. Build Content Payload
    const provider = new GupshupProvider()
    const contentPayload: any = sendType === 'template' 
      ? { type: 'template', templateId: templateData.gupshup_template_id, variables: metadata?.variables || [] }
      : { type: 'text', content: clinic.use_shared_number ? `Hi, this is ${clinic.name}: ${message}` : message }

    // 6. Send Attempt
    let result = await provider.sendMessage(phoneNumber, contentPayload, config)

    // Fallback SMS for criticals
    if (!result.success && (metadata?.type?.includes('appointment'))) {
      const { sendSms, isSmsConfigured } = await import('@/lib/sms/msg91')
      if (isSmsConfigured()) {
        const smsResult = await sendSms({ to: phoneNumber, message: clinic.use_shared_number ? `Hi, this is ${clinic.name}: ${message}` : message })
        if (smsResult.success) result = { success: true, status: 'sent', messageId: smsResult.messageId } as any
      }
    }

    if (!result.success) throw new Error(result.error || 'Provider send failed')

    // 7. Success Finalization
    if (queueEntry) await supabase.from('message_queue').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', queueEntry.id)
    await SubscriptionGate.incrementUsage(supabase, clinicId, 'message')

    if (patientId) {
      await supabase.from('reminder_logs').insert({
        clinic_id: clinicId, patient_id: patientId, phone: phoneNumber, message: message,
        type: metadata?.type || 'manual', status: 'sent', message_id: result.messageId,
        metadata: { ...metadata, sendType, templateId: templateData?.id }
      })
    }

    return { success: true, messageId: result.messageId, status: 'sent' }

  } catch (error: any) {
    console.error('[WhatsApp] Send failed:', error)
    if (queueEntry) {
      // Get current attempts to increment
      const { data: current } = await supabase.from('message_queue').select('attempts').eq('id', queueEntry.id).single()
      const nextAttempt = (current?.attempts || 0) + 1
      
      await supabase.from('message_queue').update({ 
        attempts: nextAttempt, 
        next_retry_at: new Date(Date.now() + (nextAttempt * 10) * 60 * 1000).toISOString(),
        error_log: supabase.rpc('append_jsonb', { 
            json_col_name: 'error_log', 
            payload: { error: error.message, at: new Date().toISOString() } 
        })
      } as any).eq('id', queueEntry.id)
    }
    return { success: false, status: 'failed', error: error.message }
  }
}
