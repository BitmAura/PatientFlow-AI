import { createClient } from '@/lib/supabase/server';
import { PRICING_PLANS, PricingPlanId } from '@/lib/billing/plans';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SubscriptionStatus {
  planId: PricingPlanId;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  trialEnd: string | null;
  periodEnd: string | null;
  appointmentsUsed: number;
  appointmentsLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  doctorsCount: number;
  doctorsLimit: number;
  canAddDoctor: boolean;
  daysLeft: number;
  isTrial: boolean;
}

const PLAN_LIMITS = {
  starter: { appointments: 500, messages: 500, doctors: 3 },
  growth: { appointments: 2000, messages: 2000, doctors: 10 },
  pro: { appointments: Infinity, messages: Infinity, doctors: Infinity },
};

/**
 * Server-side Subscription Gate
 */
export class SubscriptionGate {
  
  static async getSubscription(supabase: SupabaseClient, clinicId: string): Promise<SubscriptionStatus | null> {
    // 1. Get clinic and its billing owner (usually the first 'owner' staff)
    const { data: ownerStaff } = await supabase
      .from('staff')
      .select('user_id')
      .eq('clinic_id', clinicId)
      .eq('role', 'owner')
      .maybeSingle();

    if (!ownerStaff?.user_id) return null;

    // 2. Get active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', ownerStaff.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) return null;

    // 3. Get current usage
    const periodStart = sub.current_period_start || sub.trial_start;
    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', sub.id)
      .gte('period_start', periodStart)
      .maybeSingle();

    // 4. Get current doctors count
    const { count: doctorsCount } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    const planId = sub.plan_id as PricingPlanId;
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.starter;
    
    // Calculate days left
    const expiry = sub.status === 'trialing' ? sub.trial_end : sub.current_period_end;
    const daysLeft = expiry ? Math.max(0, Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      planId,
      status: sub.status,
      trialEnd: sub.trial_end,
      periodEnd: sub.current_period_end,
      appointmentsUsed: usage?.appointments_count || 0,
      appointmentsLimit: limits.appointments,
      messagesUsed: usage?.whatsapp_messages_sent || 0,
      messagesLimit: limits.messages,
      doctorsCount: doctorsCount || 0,
      doctorsLimit: limits.doctors,
      canAddDoctor: (doctorsCount || 0) < limits.doctors,
      daysLeft,
      isTrial: sub.status === 'trialing'
    };
  }

  /**
   * Hard Quota Check
   * Throws or returns false if limit reached.
   */
  static async checkQuota(supabase: SupabaseClient, clinicId: string, type: 'appointment' | 'message' | 'doctor'): Promise<{ allowed: boolean; reason?: string }> {
    const sub = await this.getSubscription(supabase, clinicId);
    if (!sub) return { allowed: false, reason: 'no_subscription' };

    // Block all if expired or trials ended
    if (sub.status === 'expired' || (sub.isTrial && sub.daysLeft <= 0)) {
        return { allowed: false, reason: 'trial_ended' };
    }

    if (type === 'appointment' && sub.appointmentsUsed >= sub.appointmentsLimit) {
      return { allowed: false, reason: 'appointment_limit_reached' };
    }

    if (type === 'message' && sub.messagesUsed >= sub.messagesLimit) {
      return { allowed: false, reason: 'message_limit_reached' };
    }

    if (type === 'doctor' && !sub.canAddDoctor) {
        return { allowed: false, reason: 'doctor_limit_reached' };
    }

    return { allowed: true };
  }

  /**
   * Atomic usage increment via RPC
   */
  static async incrementUsage(supabase: SupabaseClient, clinicId: string, type: 'appointment' | 'message') {
    const { data: ownerStaff } = await supabase
        .from('staff')
        .select('user_id')
        .eq('clinic_id', clinicId)
        .eq('role', 'owner')
        .maybeSingle();

    if (!ownerStaff?.user_id) return;

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', ownerStaff.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!sub) return;

    const appointmentsInc = type === 'appointment' ? 1 : 0;
    const whatsappInc = type === 'message' ? 1 : 0;

    await supabase.rpc('increment_subscription_usage', {
        p_subscription_id: sub.id,
        p_appointments_increment: appointmentsInc,
        p_whatsapp_increment: whatsappInc
    });
  }
}
