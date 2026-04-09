import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsAppMessage } from '@/services/whatsapp-service'

/**
 * WhatsApp Retry Queue Processor
 * 🕒 Frequency: Every 15 minutes
 * 🏥 Purpose: Processes messages in 'pending' status that are ready for retry.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient() as any
  
  // 0. Start Health Tracking
  const { data: cronRun } = await supabase.from('cron_runs').insert({
    job_name: 'whatsapp_retry_queue',
    status: 'running',
    started_at: new Date().toISOString()
  }).select('id').single()

  // 1. Fetch pending messages ready for retry
  const { data: pendingMessages, error: fetchError } = await supabase
    .from('message_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('attempts', 3) // max attempts
    .lte('next_retry_at', new Date().toISOString())
    .limit(50) // Batch process to avoid timeout

  if (fetchError) {
    console.error('[Queue Cron] Fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!pendingMessages || pendingMessages.length === 0) {
    return NextResponse.json({ processed: 0, status: 'idle' })
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  // 2. Process in sequence to respect rate limits per clinic
  for (const msg of pendingMessages) {
    try {
      // Re-attempt the send
      // Note: sendWhatsAppMessage will handle Guard checks, Session Window, 
      // and update the queue status (attempts, next_retry_at, etc.)
      const sendResult = await sendWhatsAppMessage(
        msg.clinic_id,
        msg.phone,
        msg.message_body,
        {
          patientId: msg.patient_id,
          type: msg.message_type
        }
      )

      if (sendResult.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push(`Msg ${msg.id}: ${sendResult.error}`)
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`Msg ${msg.id} Exception: ${err.message}`)
    }
  }

  // 3. Clean up expired messages (moved to a 'failed' or 'expired' state after 3 attempts)
  await supabase
    .from('message_queue')
    .update({ status: 'failed' })
    .eq('status', 'pending')
    .gte('attempts', 3)

  // 4. Update Health Tracking
  if (cronRun) {
    await supabase.from('cron_runs')
      .update({ 
        status: 'success', 
        finished_at: new Date().toISOString(),
        processed_count: pendingMessages.length,
        metadata: results
      })
      .eq('id', cronRun.id)
  }

  return NextResponse.json({ 
    processed: pendingMessages.length, 
    results 
  })
}
