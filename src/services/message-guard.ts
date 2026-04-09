import { createClient } from '@/lib/supabase/server';
import { SubscriptionGate } from '@/lib/subscription-gate';

export type GuardReason = 
  | 'opted_out' 
  | 'active_journey' 
  | 'lead_in_progress' 
  | 'duplicate_window' 
  | 'outside_hours' 
  | 'quota_exceeded'
  | 'no_subscription'
  | 'trial_ended'
  | 'no_consent'
  | 'human_active_window';

export interface GuardResult {
  allowed: boolean;
  reason?: GuardReason;
}

/**
 * The Central Message Guard
 * ENFORCER: Must be called before any WhatsApp send.
 */
export async function messageGuard(
  clinicId: string, 
  patientId: string | null, 
  phone: string,
  engine: 'lead' | 'recall' | 'reminder' | 'manual' = 'manual'
): Promise<GuardResult> {
  const supabase = createClient();

  // 1. BLACKLIST CHECK (Global & Patient level)
  if (patientId) {
    const { data: patient } = await supabase
      .from('patients')
      .select('opted_out, whatsapp_consent')
      .eq('id', patientId)
      .single();
    
    if (patient?.opted_out) return { allowed: false, reason: 'opted_out' };

    // 1b. CONSENT CHECK (New pillar)
    // Automated engines must only send to consented patients.
    if (engine !== 'manual' && !patient?.whatsapp_consent) {
       return { allowed: false, reason: 'no_consent' };
    }
  }

  const { data: blacklisted } = await supabase
    .from('global_blacklist')
    .select('phone')
    .eq('phone', phone)
    .maybeSingle();

  if (blacklisted) return { allowed: false, reason: 'opted_out' };

  // 2. ACTIVE JOURNEY LOCK
  if (patientId) {
    const { data: journey } = await supabase
      .from('patient_journeys')
      .select('status, automation_locked')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (journey?.automation_locked) return { allowed: false, reason: 'active_journey' };
  }

  // 3. CROSS-ENGINE CONFLICT (Lead vs Recall)
  if (engine === 'recall') {
    const { data: lead } = await supabase
      .from('leads')
      .select('status')
      .eq('phone', phone)
      .eq('clinic_id', clinicId)
      .in('status', ['new', 'contacted', 'responsive'])
      .maybeSingle();
    
    if (lead) return { allowed: false, reason: 'lead_in_progress' };
  }

  // 4. IDEMPOTENCY CHECK (12-hour window)
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const { data: lastMsg } = await supabase
    .from('reminder_logs')
    .select('id')
    .eq('phone', phone)
    .eq('status', 'sent')
    .gt('created_at', twelveHoursAgo)
    .maybeSingle();

  if (lastMsg) return { allowed: false, reason: 'duplicate_window' };

  // 5. BUSINESS HOURS (9 AM - 7 PM IST)
  // Converting local time to IST (UTC+5:30)
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = istTime.getHours();
  
  if (hour < 9 || hour >= 19) {
    return { allowed: false, reason: 'outside_hours' };
  }

  // 6. HUMAN INTERVENTION CHECK (15-min window)
  // If a human messaged recently, don't let automation interrupt.
  if (engine !== 'manual') {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: humanMsg } = await supabase
      .from('patient_messages')
      .select('id')
      .eq('phone_number', phone)
      .eq('direction', 'outbound')
      .gt('created_at', fifteenMinsAgo)
      // Check metadata for manual flag. Assuming human messages are marked as such.
      .contains('metadata', { source: 'manual' })
      .maybeSingle();

    if (humanMsg) return { allowed: false, reason: 'human_active_window' };
  }

  // 6. SUBSCRIPTION QUOTA
  const quota = await SubscriptionGate.checkQuota(supabase, clinicId, 'message');
  if (!quota.allowed) {
    return { allowed: false, reason: quota.reason as GuardReason };
  }

  return { allowed: true };
}

/**
 * Helper to log blocked messages
 */
export async function logBlockedMessage(
    clinicId: string,
    patientId: string | null,
    phone: string,
    message: string,
    reason: GuardReason,
    type: string = 'manual'
) {
    const supabase = createClient();
    await supabase.from('reminder_logs').insert({
        clinic_id: clinicId,
        patient_id: patientId,
        phone,
        message,
        type,
        status: 'blocked',
        error: `Blocked by Guard: ${reason}`,
        metadata: { block_reason: reason }
    });
}
