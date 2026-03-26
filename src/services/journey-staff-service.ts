import { createClient } from '@/lib/supabase/client';
import { StuckJourney } from '@/types/journeys';

export class JourneyStaffService {

  /**
   * Fetches actionable journeys for the Command Center.
   */
  static async getStuckJourneys(clinicId: string): Promise<StuckJourney[]> {
    const supabase = createClient() as any;
    
    // Using the view we created
    const { data, error } = await supabase
      .from('view_stuck_journeys')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('automation_enabled', true) // Filter out ones already handled? Or show them differently? 
      // User requirement: "Show Patients stuck in stages". 
      // Probably show all stuck ones, even if automation paused, but maybe sort them.
      // Let's remove the filter for now to show everything.
    
    // Re-query without filter for now
    const { data: allStuck, error: viewError } = await supabase
      .from('view_stuck_journeys')
      .select('*')
      .eq('clinic_id', clinicId);

    if (viewError) throw viewError;
    if (!allStuck) return [];

    return allStuck.map((row: any) => ({
      ...row,
      suggested_action: this.deriveSuggestedAction(row)
    }));
  }

  private static deriveSuggestedAction(row: any): 'call_patient' | 'monitor' | 'escalate' {
    if (row.delay_status === 'high_risk') return 'escalate';
    if (row.days_overdue > 3) return 'call_patient';
    return 'monitor';
  }

  /**
   * Performs a staff action and stops automation.
   */
  static async performAction(
    journeyId: string, 
    stageId: string, 
    action: 'call_patient' | 'mark_pending' | 'advance_stage' | 'drop_patient' | 'snooze',
    staffId: string,
    meta: any = {}
  ) {
    const supabase = createClient() as any;

    // 1. Log the Action
    console.log(`Staff ${staffId} performing ${action} on journey ${journeyId}`);

    // Parallelize logging and stopping automation
    await Promise.all([
      supabase.from('journey_transitions' as any).insert({
        journey_id: journeyId,
        from_stage_id: stageId,
        action: `staff_${action}`,
        actor_id: staffId,
        meta: { ...meta, timestamp: new Date().toISOString() }
      }),
      this.stopAutomation(stageId, journeyId)
    ]);

    switch (action) {
      case 'advance_stage':
        await this.advanceStage(journeyId, stageId);
        break;
      case 'drop_patient':
        await this.dropPatient(journeyId);
        break;
      case 'snooze':
        await this.snoozeStage(journeyId, stageId);
        break;
    }
  }

  private static async snoozeStage(journeyId: string, stageId: string) {
    const supabase = createClient() as any;
    
    // 1. Check current snooze count
    const { data: journey } = await supabase
      .from('patient_journeys' as any)
      .select('snooze_count')
      .eq('id', journeyId)
      .single();
    
    if (!journey) throw new Error('Journey not found');
    
    if ((journey.snooze_count || 0) >= 2) {
      throw new Error('Snooze limit reached (2). Staff must Call, Advance, or Drop.');
    }

    // 2. Increment Snooze Count & Unlock Automation (Special Case?)
    // Wait, prompt says "When ANY staff action is performed: automation_locked = true".
    // If we snooze, we extend the deadline. If we lock automation, the bot won't send anything anyway.
    // This seems correct: Snooze = "Stop pestering me and the patient".
    // The dashboard "Stuck" view will clear because we extend expected_completion_at.
    
    // 3. Update Stage Deadline (Extend by 3 days)
    // First get current expected_completion_at
    const { data: stage } = await supabase
      .from('patient_journey_stages' as any)
      .select('expected_completion_at')
      .eq('id', stageId)
      .single();

    if (!stage) throw new Error('Stage not found');

    const currentDeadline = new Date(stage.expected_completion_at || new Date());
    const newDeadline = new Date(currentDeadline.setDate(currentDeadline.getDate() + 3));

    await supabase
      .from('patient_journey_stages' as any)
      .update({ 
        expected_completion_at: newDeadline.toISOString(),
        delay_status: 'none' // Clear delay status
      })
      .eq('id', stageId);

    // 4. Increment Count
    await supabase
      .from('patient_journeys' as any)
      .update({ snooze_count: (journey.snooze_count || 0) + 1 })
      .eq('id', journeyId);
      
    console.log(`[Snooze] Extended deadline to ${newDeadline.toISOString()} (Count: ${(journey.snooze_count || 0) + 1})`);
  }

  private static async stopAutomation(stageId: string, journeyId: string) {
    const supabase = createClient() as any;
    
    // Parallel updates
    await Promise.all([
      supabase
        .from('patient_journey_stages' as any)
        .update({ automation_enabled: false })
        .eq('id', stageId),
      supabase
        .from('patient_journeys' as any)
        .update({ 
          automation_locked: true,
          automation_locked_at: new Date().toISOString()
        })
        .eq('id', journeyId)
    ]);
  }

  private static async advanceStage(journeyId: string, currentStageId: string) {
    const supabase = createClient() as any;
    
    // Complete current stage
    await supabase
      .from('patient_journey_stages' as any)
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', currentStageId);

    // Find next stage (simplified logic - ideally query template structure)
    // For now, let's assume we need a proper JourneyService to handle next-step logic.
    // Placeholder: Log that manual advancement happened.
    console.log('Stage advanced manually. Next stage logic would trigger here.');
    
    // In a real implementation, we'd query journey_stages where order_index > current and instantiate it.

    // 4. Update Journey Status (Global)
    await supabase
      .from('patient_journeys' as any)
      .update({ 
        automation_locked: false, // RESET LOCK on new stage
        automation_locked_at: null,
        snooze_count: 0 // RESET SNOOZE COUNT
      })
      .eq('id', journeyId);
  }

  private static async dropPatient(journeyId: string) {
    const supabase = createClient() as any;
    await supabase
      .from('patient_journeys' as any)
      .update({ status: 'cancelled', end_date: new Date().toISOString() })
      .eq('id', journeyId);
  }
}
