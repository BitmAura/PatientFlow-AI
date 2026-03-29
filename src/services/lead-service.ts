import { createClient } from '@/lib/supabase/client';
import { Lead, LeadStatus, LeadSource } from '@/types/leads';
import { Database } from '@/types/database';
import { sendWhatsAppMessage } from '@/lib/whatsapp/send-message';
import { RecallService } from './recall-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { getClinicSubscriptionEligibility, trackClinicUsage } from '@/lib/billing/subscription-guard';
import { buildBookingLink } from '@/lib/utils/public-url';

type DbLeadStatus = Database['public']['Enums']['lead_status'];

/**
 * Lead Lifecycle & Discipline Engine
 * Enforces strict state transitions and logs all activities.
 */
export class LeadService {
  
  /**
   * Allowed State Transitions
   * Defines valid next states for each current state.
   */
  private static readonly TRANSITIONS: Record<DbLeadStatus, DbLeadStatus[]> = {
    'new': ['contacted', 'invalid', 'lost', 'booked'], // 'booked' allowed for direct walk-ins
    'contacted': ['responsive', 'lost', 'invalid', 'booked'], // 'booked' allowed if they book during contact
    'responsive': ['booked', 'lost', 'contacted'], // 'contacted' allowed if we reach out again
    'booked': ['lost', 'contacted'], // 'lost' if they cancel/no-show and we give up; 'contacted' if we reschedule/follow up
    'lost': ['new', 'contacted'], // Reactivation allowed
    'invalid': ['new'], // Correction allowed
  };

  /**
   * Owner Dashboard: Lead Leak Metrics
   * Returns high-level stats for accountability.
   */
  static async getOwnerDashboardStats(supabase: SupabaseClient, clinicId: string): Promise<{
    totalLeads: number;
    contactedIn5Mins: number;
    conversionRate: number;
    leaksCount: number;
  }> {
    // Fetch all leads (lightweight selection)
    // In production, this should be aggregated via RPC or filtered by date (e.g., last 30 days)
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, status, created_at, last_contacted_at')
      .eq('clinic_id', clinicId);

    if (error) throw error;
    if (!leads) return { totalLeads: 0, contactedIn5Mins: 0, conversionRate: 0, leaksCount: 0 };

    const totalLeads = leads.length;
    let bookedCount = 0;
    let fastResponseCount = 0;
    let leaksCount = 0;

    const now = new Date().getTime();
    const tenMins = 10 * 60 * 1000;
    const twoDays = 2 * 24 * 60 * 60 * 1000;

    for (const lead of leads) {
      // 1. Conversion
      if (lead.status === 'booked') {
        bookedCount++;
      }

      // 2. Response Time < 5 mins
      // Check if last_contacted_at exists and is within 5 mins of created_at
      if (lead.last_contacted_at) {
        const created = new Date(lead.created_at).getTime();
        const contacted = new Date(lead.last_contacted_at).getTime();
        if (contacted - created <= 5 * 60 * 1000) {
          fastResponseCount++;
        }
      }

      // 3. Current Leaks (Snapshot)
      // Leak A: New > 10 mins
      const created = new Date(lead.created_at).getTime();
      if (lead.status === 'new' && (now - created > tenMins)) {
        leaksCount++;
      }
      // Leak B: Contacted > 2 days (Stuck)
      // Note: We use updated_at or last_contacted_at usually. Let's use last_contacted_at for accuracy of "stuck"
      if (lead.status === 'contacted' && lead.last_contacted_at) {
         const contacted = new Date(lead.last_contacted_at).getTime();
         if (now - contacted > twoDays) {
           leaksCount++;
         }
      }
    }

    return {
      totalLeads,
      contactedIn5Mins: fastResponseCount,
      conversionRate: totalLeads > 0 ? (bookedCount / totalLeads) * 100 : 0,
      leaksCount
    };
  }

  /**
   * Owner Dashboard: Get Actual Leak List
   * Returns specific leads that are leaking.
   */
  static async getLeadLeaks(supabase: SupabaseClient, clinicId: string): Promise<{
    missedInstantResponse: Lead[];
    stalledPipeline: Lead[];
  }> {
    const now = new Date();
    
    // 1. Missed Instant Response: Status 'new', created > 10 mins ago
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const { data: missedInstant } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'new')
      .lt('created_at', tenMinsAgo)
      .order('created_at', { ascending: true }); // Oldest first

    // 2. Stalled Pipeline: Status 'contacted', last_contacted > 2 days ago
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const { data: stalled } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'contacted')
      .lt('last_contacted_at', twoDaysAgo)
      .order('last_contacted_at', { ascending: true }); // Oldest first

    return {
      missedInstantResponse: missedInstant || [],
      stalledPipeline: stalled || []
    };
  }

  /**
   * Process Daily Follow-ups
   * - Finds leads due for follow-up (contacted, no response)
   * - Sends reminders based on schedule (Day +1, +3)
   * - Escalates on Day +5
   */
  static async processFollowUps(supabase: SupabaseClient, clinicId: string): Promise<void> {

    // -1. Safeguard: Clinic Status
    const { data: clinic } = await supabase
      .from('clinics')
      .select('status')
      .eq('id', clinicId)
      .single();

    if (!clinic || clinic.status !== 'active') {
      console.log(`Skipping follow-ups for clinic ${clinicId}: Not active`);
      return;
    }

    // 0. Safeguard: Business Hours (9 AM - 7 PM)
    if (!this.checkBusinessHours()) {
      console.log(`Skipping follow-ups for clinic ${clinicId}: Outside business hours`);
      return;
    }

    const now = new Date().toISOString();

    // 1. Find leads due for follow-up
    // Criteria: status='contacted', next_followup_at <= now
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'contacted')
      .lte('next_followup_at', now)
      .lt('followup_count', 3); // Max 3 follow-ups (Day 1, 3, 5)

    if (error) throw error;
    if (!leads || leads.length === 0) return;

    console.log(`Processing ${leads.length} follow-ups for clinic ${clinicId}`);

    for (const lead of leads) {
      await this.executeFollowUp(supabase, clinicId, lead);
    }
  }

  /**
   * Check if currently within business hours (9 AM - 7 PM)
   */
  private static checkBusinessHours(): boolean {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 19;
  }

  /**
   * Execute single follow-up logic
   */
  private static async executeFollowUp(supabase: SupabaseClient, clinicId: string, lead: Lead): Promise<void> {
    try {

      // 1. Safeguard: Lead Opt-Out & Conversion Check
      if (lead.is_opted_out) {
          await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Lead explicitly opted out');
          await supabase.from('leads').update({ next_followup_at: null } as any).eq('id', lead.id);
          return;
      }
      if (lead.converted_patient_id) {
          await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Lead already converted to patient');
          await supabase.from('leads').update({ status: 'booked', next_followup_at: null } as any).eq('id', lead.id);
          return;
      }

      // 2. Safeguard: Check Patient Opt-Out Status (if linked by phone)
      if (lead.phone) {
        // A. Check Cross-Engine Spam (Active Recall?)
        const hasActiveRecall = await RecallService.hasActiveRecall(clinicId, lead.phone);
        if (hasActiveRecall) {
             await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Active recall process detected');
             return; // Do not clear next_followup_at, just skip this turn to prevent double messaging.
        }

        // B. Check Patient Table Opt-out & Active Journey
        const { data: patient } = await supabase
          .from('patients')
          .select('lifecycle_stage, whatsapp_opt_in, has_active_journey')
          .eq('clinic_id', clinicId)
          .eq('phone', lead.phone)
          .single();

        if (patient) {
          // Rule: Active Journey = NO Lead Automation
          if (patient.has_active_journey) {
             await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Patient has active journey');
             return; 
          }

          if (patient.lifecycle_stage === 'opted_out' || patient.whatsapp_opt_in === false) {
            await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Patient opted out');
             await supabase
              .from('leads')
              .update({ next_followup_at: null, is_opted_out: true } as any) // Sync opt-out
              .eq('id', lead.id);
            return;
          }
        }
      }

      // 3. Safeguard: Idempotency (Prevent duplicate sends)
      // Check if a follow-up was sent in the last 12 hours
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const { data: recentLogs } = await supabase
        .from('lead_activities')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('type', 'followup_sent')
        .gt('created_at', twelveHoursAgo)
        .limit(1);

      if (recentLogs && recentLogs.length > 0) {
        console.log(`Skipping follow-up for lead ${lead.id}: Already sent recently`);
        return;
      }

      const currentCount = lead.followup_count || 0;
      
      // 4. Safeguard: Final Cap Check (Race condition protection)
      if (currentCount >= 3) {
          await this.logActivity(supabase, lead.id, 'followup_skipped', 'Skipped follow-up: Max attempts reached');
          return;
      }

      let nextFollowUpDate: Date | null = null;
      let messageToSend: string | null = null;
      let activityType = 'followup_sent';
      let activityDesc = '';

      // Schedule Logic
      // If count=0 (Day 0 was initial contact), now is Day +1.
      // If count=1 (Day +1 done), now is Day +3.
      // If count=2 (Day +3 done), now is Day +5 (Escalation).

      if (currentCount === 0) {
        // Day +1 Reminder
        const firstName = lead.full_name.split(' ')[0];
        messageToSend = `Hi ${firstName}, just checking if you had any questions about your appointment?`;
        nextFollowUpDate = new Date();
        nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 2); // Schedule next for Day +3 (2 days from now)
        activityDesc = 'Sent Day +1 Follow-up';
      } else if (currentCount === 1) {
        // Day +3 Reminder
        const firstName = lead.full_name.split(' ')[0];
        messageToSend = `Hi ${firstName}, are you still interested in booking with us? Slots are filling up fast!`;
        nextFollowUpDate = new Date();
        nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 2); // Schedule next for Day +5 (2 days from now)
        activityDesc = 'Sent Day +3 Follow-up';
      } else if (currentCount === 2) {
        // Day +5 Escalation
        // No message to lead, just internal flag
        activityType = 'escalation_required';
        activityDesc = 'Marked for Staff Escalation (Day +5)';
        nextFollowUpDate = null; // End of auto-sequence
      }

      // 5. Send Message (if applicable)
      if (messageToSend && lead.phone) {
         const eligibility = await getClinicSubscriptionEligibility(clinicId);
         if (!eligibility.canSendMessages) {
           await this.logActivity(supabase, lead.id, 'followup_skipped', eligibility.message || 'Skipped follow-up: inactive subscription');
           return;
         }
         const result = await sendWhatsAppMessage(clinicId, lead.phone, messageToSend, {
             leadId: lead.id,
             type: 'auto_followup'
         });
         
         if (!result.success) {
             await this.logActivity(supabase, lead.id, 'followup_failed', `Failed to send followup: ${result.error}`);
             return; // Don't increment count if failed
         }
         await trackClinicUsage(clinicId, 'lead_messages', 1, {
           leadId: lead.id,
           flow: 'auto_followup',
         });
      }

      // 6. Update Lead (Increment count, set next date)
      await supabase
        .from('leads')
        .update({
          followup_count: currentCount + 1,
          next_followup_at: nextFollowUpDate ? nextFollowUpDate.toISOString() : null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', lead.id);

      // 7. Log Activity
      await this.logActivity(supabase, lead.id, activityType, activityDesc, null, {
        followup_count: currentCount,
        scheduled_next: nextFollowUpDate
      });

    } catch (err) {
      console.error(`Error processing follow-up for lead ${lead.id}:`, err);
    }
  }

  /**
   * Create a new Lead
   * - Automatically sets state = 'new'
   * - Records created_at, source
   */
  static async createLead(
    supabase: SupabaseClient,
    clinicId: string,
    data: {
      full_name: string;
      phone?: string;
      email?: string;
      source: LeadSource;
      interest?: string;
      notes?: string;
    }
  ): Promise<Lead> {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        clinic_id: clinicId,
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        status: 'new', // Force initial status
        interest: data.interest,
        notes: data.notes,
        followup_count: 0,
        next_followup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Schedule 1st follow-up in 24h
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Log creation activity
    await this.logActivity(supabase, lead.id, 'lead_created', `Lead created via ${data.source}`);

    // Trigger Instant Response Engine
    try {
      await this.sendInstantResponse(supabase, clinicId, lead);
      // If successful, the lead status might have updated to 'contacted'.
      // We should ideally re-fetch or update the local object, but for now returning the created lead is fine.
      // Or we can manually update the local object status if we want the UI to reflect it immediately.
    } catch (error) {
      console.error('Instant response failed:', error);
      // We don't throw here because the lead was successfully created.
    }

    return lead;
  }

  /**
   * Instant Lead Response Engine
   * - Validates safeguards (Opt-out, duplicate checks)
   * - Sends personal WhatsApp message
   * - Updates status to 'contacted'
   */
  private static async sendInstantResponse(supabase: SupabaseClient, clinicId: string, lead: Lead): Promise<void> {
    if (!lead.phone) return;
    const eligibility = await getClinicSubscriptionEligibility(clinicId);
    if (!eligibility.canSendMessages) {
      await this.logActivity(supabase, lead.id, 'response_skipped', eligibility.message || 'Skipped instant response: inactive subscription');
      return;
    }

    // 1. Safeguard: Check Opt-Out Status in Patients table
    // (Assuming leads might be existing patients or we respect global phone blacklist)
    const { data: patient } = await supabase
      .from('patients')
      .select('lifecycle_stage, whatsapp_opt_in')
      .eq('clinic_id', clinicId)
      .eq('phone', lead.phone)
      .single();

    if (patient) {
      if (patient.lifecycle_stage === 'opted_out' || patient.whatsapp_opt_in === false) {
        await this.logActivity(supabase, lead.id, 'response_skipped', 'Skipped instant response: Patient opted out');
        return;
      }
    }

    // 2. Safeguard: Anti-Spam / Idempotency
    // Check if we sent a response to this phone in the last 24 hours (across any lead)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await supabase
      .from('lead_activities')
      .select('id')
      .eq('type', 'instant_response_sent')
      .gt('created_at', oneDayAgo)
      .limit(1); // We need to join with leads to check phone, but leads don't have phone in activity...
      // Actually, let's check 'leads' table for other leads with same phone created recently
    
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', lead.phone)
      .neq('id', lead.id) // Exclude current lead
      .gt('created_at', oneDayAgo)
      .limit(1);

    if (recentLeads && recentLeads.length > 0) {
       // If they submitted a lead recently, check if we contacted them.
       // For simplicity, if they submitted a lead < 24h ago, we assume we already auto-responded or they are in the system.
       // To be safe and avoid spam, we skip.
       await this.logActivity(supabase, lead.id, 'response_skipped', 'Skipped instant response: Recent lead exists for this phone');
       return;
    }

    // 3. Fetch Clinic Details for Message
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name, slug, website, status')
      .eq('id', clinicId)
      .single();
    
    if (!clinic) throw new Error('Clinic not found');

    if (clinic.status !== 'active') {
      await this.logActivity(supabase, lead.id, 'response_skipped', 'Skipped instant response: Clinic not active');
      return;
    }

    const firstName = lead.full_name.split(' ')[0];
      const bookingLink = clinic.slug 
        ? buildBookingLink(clinic.slug)
        : clinic.website || '#';

    // 4. Construct Message
    // "Hi [Name], thanks for reaching out to [Clinic Name]. Here is a link to book your appointment: [Link]. - [Clinic Name]"
    const message = `Hi ${firstName}, thanks for reaching out to ${clinic.name}. You can book your appointment directly here: ${bookingLink}`;

    // 5. Send Message
    const result = await sendWhatsAppMessage(clinicId, lead.phone, message, {
        leadId: lead.id,
        type: 'instant_lead_response'
    });

    if (result.success) {
      // 6. Update Status
      await this.updateStatus(supabase, lead.id, 'contacted', undefined, 'Auto-updated via Instant Response Engine');
      
      // 7. Log specific activity
      await this.logActivity(supabase, lead.id, 'instant_response_sent', `Sent WhatsApp to ${lead.phone}`, null, { messageId: result.messageId });
      await trackClinicUsage(clinicId, 'lead_messages', 1, {
        leadId: lead.id,
        flow: 'instant_response',
      });
    } else {
      await this.logActivity(supabase, lead.id, 'response_failed', `WhatsApp failed: ${result.error}`);
    }
  }

  /**
   * Update Lead Status
   * - Enforces valid transitions
   * - Logs activity
   */
  static async updateStatus(
    supabase: SupabaseClient,
    leadId: string,
    newStatus: LeadStatus,
    actorId?: string,
    notes?: string
  ): Promise<void> {

    // 1. Fetch current status
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) throw new Error('Lead not found');

    const currentStatus = lead.status;

    // 2. Validate Transition
    if (currentStatus !== newStatus) {
      this.validateTransition(currentStatus, newStatus);
    } else {
      // No-op if status is same
      return;
    }

    // 3. Update Status
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        last_contacted_at: newStatus === 'contacted' ? new Date().toISOString() : undefined
      } as any)
      .eq('id', leadId);

    if (updateError) throw updateError;

    // 4. Log Activity
    await this.logActivity(
      supabase,
      leadId,
      'status_change',
      `Status changed from ${currentStatus} to ${newStatus}. ${notes || ''}`,
      actorId
    );
  }

  /**
   * Log an activity for a lead
   */
  static async logActivity(
    supabase: SupabaseClient,
    leadId: string,
    type: string,
    description: string,
    actorId?: string | null,
    metadata?: any
  ): Promise<void> {

    const { error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        actor_id: actorId,
        type: type,
        description: description,
        metadata: metadata,
        created_at: new Date().toISOString(),
      } as any);

    if (error) {
      console.error('Failed to log lead activity:', error);
      // Don't throw here to avoid blocking the main operation, 
      // but in strict discipline mode, maybe we should?
      // For now, logging error is safer.
    }
  }

  /**
   * Validate if a transition is allowed
   */
  private static validateTransition(current: DbLeadStatus, next: DbLeadStatus): void {
    const allowed = this.TRANSITIONS[current];
    if (!allowed || !allowed.includes(next)) {
      throw new Error(`Invalid state transition: Cannot move from '${current}' to '${next}'. Allowed: ${allowed?.join(', ')}`);
    }
  }

  /**
   * Get Escalated Leads (Hot Leads Needing Attention)
   * Criteria:
   * - Status = 'contacted' AND Follow-up Count >= 3 (Failed automation)
   * - OR Status = 'responsive' (Needs manual conversion)
   * - Ordered by next_followup_at ASC (Overdue first)
   */
  static async getEscalatedLeads(supabase: SupabaseClient, clinicId: string): Promise<Lead[]> {
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .or('status.eq.responsive,and(status.eq.contacted,followup_count.gte.3)')
      .order('next_followup_at', { ascending: true, nullsFirst: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Record Staff Outcome
   * Handles manual interventions and updates state/logging accordingly.
   */
  static async recordStaffOutcome(
    supabase: SupabaseClient,
    leadId: string,
    actorId: string,
    outcome: 'booked' | 'not_interested' | 'invalid' | 'call_later',
    notes?: string,
    nextFollowUpDate?: string
  ): Promise<void> {
    let newStatus: LeadStatus;
    let description: string;

    switch (outcome) {
      case 'booked':
        newStatus = 'booked';
        description = 'Staff marked as Booked';
        break;
      case 'not_interested':
        newStatus = 'lost';
        description = 'Staff marked as Not Interested';
        break;
      case 'invalid':
        newStatus = 'invalid';
        description = 'Staff marked as Invalid Lead';
        break;
      case 'call_later':
        newStatus = 'responsive'; // Move to responsive to stop automation but keep in staff view
        description = 'Staff scheduled callback';
        break;
      default:
        throw new Error('Invalid outcome');
    }

    // 1. Update Status (Transition validation handles logic)
    await this.updateStatus(supabase, leadId, newStatus, actorId, notes);

    // 2. If "Call Later", update next_followup_at manually
    if (outcome === 'call_later' && nextFollowUpDate) {
      await supabase
        .from('leads')
        .update({
          next_followup_at: nextFollowUpDate,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', leadId);
    }

    // 3. Log specific outcome activity
    await this.logActivity(supabase, leadId, 'staff_intervention', description, actorId, {
      outcome,
      notes,
      scheduled_for: nextFollowUpDate
    });
  }

  /**
   * Handle Lead Opt-Out (STOP)
   * - Updates Lead to opted out
   * - Updates Patient if linked
   * - Stops all automation
   */
  static async handleOptOut(supabase: SupabaseClient, clinicId: string, phone: string): Promise<void> {

    // 1. Find leads with this phone
    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', phone);

    if (leads && leads.length > 0) {
      for (const lead of leads) {
        await supabase
          .from('leads')
          .update({ is_opted_out: true, next_followup_at: null } as any)
          .eq('id', lead.id);
        
        await this.logActivity(supabase, lead.id, 'opt_out', 'User replied STOP. Opted out of all communications.');
      }
    }

    // 2. Sync with Patient Record
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', phone)
      .single();
    
    if (patient) {
        await supabase
            .from('patients')
            .update({ lifecycle_stage: 'opted_out', whatsapp_opt_in: false } as any)
            .eq('id', patient.id);
        
        // Also cancel any recalls via RecallService
        await RecallService.handleOptOut(phone);
    }
  }

  /**
   * Get valid next states for UI
   */
  static getNextStates(currentStatus: LeadStatus): LeadStatus[] {
    return this.TRANSITIONS[currentStatus] || [];
  }
}
