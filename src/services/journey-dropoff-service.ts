import { createClient } from '@/lib/supabase/client';
import { DelayStatus } from '@/types/journeys';
import { getTemplateForStage } from '@/lib/content/anxiety-safe-templates';

export class JourneyDropOffService {
  
  /**
   * Scans for stalled journeys and updates their status.
   * Should be run via Cron (e.g., hourly or daily).
   * 
   * Rules:
   * 1. If now > expected_completion_at -> Delayed
   * 2. 1-3 days overdue -> Mild
   * 3. >3 days overdue -> High-risk
   */
  static async detectDropOffs(clinicId: string) {
    const supabase = createClient() as any;
    const now = new Date();

    // 1. Fetch 'in_progress' stages that are overdue
    // We filter out those already marked 'high_risk' to avoid redundant processing
    const { data: stalledStages, error } = await supabase
      .from('patient_journey_stages')
      .select(`
        id,
        journey_id,
        stage_id,
        expected_completion_at,
        delay_status,
        messages_sent_count,
        last_message_at,
        automation_enabled,
        journey:patient_journeys!inner(
          clinic_id, 
          patient_id, 
          automation_locked,
          patient:patients!inner(whatsapp_opt_in, lifecycle_stage)
        ),
        definition:journey_stages!inner(name, max_delay_days)
      `)
      .eq('journey.clinic_id', clinicId)
      .eq('status', 'in_progress')
      .lt('expected_completion_at', now.toISOString())
      .neq('delay_status', 'high_risk');

    if (error) {
      console.error('Error detecting drop-offs:', error);
      throw error;
    }
    
    if (!stalledStages || stalledStages.length === 0) return;

    console.log(`Found ${stalledStages.length} potentially stalled stages.`);

    // Optimize: Process in parallel
    await Promise.all(stalledStages.map((stage: any) => this.evaluateDelay(stage, now)));
  }

  private static async evaluateDelay(stage: any, now: Date) {
    if (!stage.expected_completion_at) return;

    const expectedEnd = new Date(stage.expected_completion_at);
    const diffMs = now.getTime() - expectedEnd.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let newStatus: DelayStatus = 'none';

    // Classification Rule
    if (diffDays > 3) {
      newStatus = 'high_risk';
    } else if (diffDays >= 1) {
      newStatus = 'mild';
    }

    // Status Update Logic
    // Only update if status has escalated
    if (this.isSeverityHigher(newStatus, stage.delay_status)) {
      await this.updateStatusAndTrigger(stage, newStatus);
    }
    
    // Automation Logic for 'mild' status (Anxiety-Safe Follow-Up)
    // If we are in 'mild' state (or just entered it), check if we need to send the next message
    if (newStatus === 'mild') {
      await this.processAutomatedFollowUp(stage, now);
    }
  }

  private static isSeverityHigher(newStatus: DelayStatus, currentStatus: DelayStatus | undefined): boolean {
    const severity = { 'none': 0, 'mild': 1, 'high_risk': 2 };
    const current = currentStatus ? severity[currentStatus] : 0;
    return severity[newStatus] > current;
  }

  private static async updateStatusAndTrigger(stage: any, newStatus: DelayStatus) {
    const supabase = createClient() as any;

    console.log(`Escalating stage ${stage.id} (${stage.definition.name}) to ${newStatus}`);

    // 1. Update DB
    const { error } = await supabase
      .from('patient_journey_stages' as any)
      .update({ delay_status: newStatus })
      .eq('id', stage.id);

    if (error) {
      console.error(`Failed to update status for stage ${stage.id}`, error);
      return;
    }

    // 2. Trigger Action (Status Change Only)
    // Note: Automated follow-ups are now handled by processAutomatedFollowUp independently
    // But High Risk trigger is still tied to status change
    if (newStatus === 'high_risk') {
      await this.triggerStaffEscalation(stage);
    }
  }

  private static async processAutomatedFollowUp(stage: any, now: Date) {
    // Rule: Automation must be enabled (Stage Level)
    if (stage.automation_enabled === false) {
      console.log(`[Automation Skipped] Automation disabled for stage ${stage.id} by staff.`);
      return;
    }

    // Rule: Journey must NOT be locked (Global Level)
    if (stage.journey?.automation_locked) {
      console.log(`[Automation Skipped] Journey ${stage.journey_id} is globally locked by staff action.`);
      return;
    }

    // Rule: Check global WhatsApp connection status for this clinic
    // We can fetch this once per batch or check here.
    // For safety, let's assume we check it before calling this or check it here.
    // Since we don't have connection info in 'stage', we might rely on 'automation_locked' 
    // which IS set to true during deregistration. 
    // BUT, to be double safe:
    const supabase = createClient() as any;
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('status')
      .eq('clinic_id', stage.journey.clinic_id)
      .single();

    const allowedStatuses = ['connected', 'active'];
    if (!connection || !allowedStatuses.includes(connection.status)) {
       console.log(`[Automation Skipped] WhatsApp disconnected for clinic ${stage.journey.clinic_id}`);
       return;
    }

    // Rule: Patient must be opted in
    const patient = stage.journey?.patient;
    if (patient) {
        if (patient.whatsapp_opt_in === false || patient.lifecycle_stage === 'opted_out') {
            console.log(`[Automation Skipped] Patient ${stage.journey.patient_id} has opted out.`);
            return;
        }
    }

    const messagesSent = stage.messages_sent_count || 0;
    
    // Rule: Max 2 automated messages
    if (messagesSent >= 2) return;

    // Rule: Cooldown between messages (e.g., 48 hours)
    // If we sent one recently, wait.
    if (stage.last_message_at) {
      const lastMsg = new Date(stage.last_message_at);
      const hoursSinceLast = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 48) return;
    }

    // Determine which message to send
    const template = getTemplateForStage(stage.definition.name, messagesSent);
    
    if (template) {
      await this.triggerAutomatedFollowUp(stage, template);
    }
  }

  private static async triggerAutomatedFollowUp(stage: any, template: any) {
    // Logic: Send gentle WhatsApp/Email
    console.log(`[Automated Trigger] Sending Msg #${template.sequence_index + 1} for Patient ${stage.journey.patient_id}: "${template.content}"`);
    
    const supabase = createClient() as any;
    
    // 1. Log transition
    await supabase.from('journey_transitions' as any).insert({
      journey_id: stage.journey_id,
      from_stage_id: stage.stage_id,
      to_stage_id: null,
      action: 'dropoff_warning_mild',
      meta: { 
        type: 'automated_followup', 
        reason: 'stage_delayed_mild',
        message_sequence: template.sequence_index,
        content_preview: template.content.substring(0, 50)
      }
    });

    // 2. Update tracking
    await supabase.from('patient_journey_stages' as any).update({
      messages_sent_count: (stage.messages_sent_count || 0) + 1,
      last_message_at: new Date().toISOString()
    }).eq('id', stage.id);
  }

  private static async triggerStaffEscalation(stage: any) {
    // Logic: Create task for Receptionist/Coordinator
    console.log(`[Staff Trigger] High-risk alert for Patient ${stage.journey.patient_id}`);

    const supabase = createClient() as any;
    await supabase.from('journey_transitions' as any).insert({
      journey_id: stage.journey_id,
      from_stage_id: stage.stage_id, // We need to ensure stage_id is selected
      to_stage_id: null,
      action: 'dropoff_escalation',
      meta: { type: 'staff_task', reason: 'stage_delayed_high_risk' }
    });
  }
}
