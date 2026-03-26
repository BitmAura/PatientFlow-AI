import { Database } from './database';

export type JourneyTemplate = Database['public']['Tables']['journey_templates']['Row'] & {
  stages?: JourneyStage[];
};

export type JourneyStage = Database['public']['Tables']['journey_stages']['Row'] & {
  max_delay_days?: number;
};

export type StageType = 'consultation' | 'treatment' | 'followup_auto' | 'followup_manual' | 'wait_period';

export interface StageConfig {
  // Auto Follow-up Config
  message_template?: string;
  channel?: 'whatsapp' | 'email' | 'sms';
  
  // Manual Task Config
  staff_instructions?: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Treatment Config
  required_resources?: string[]; // e.g., ["Scanner", "Surgeon"]
  duration_minutes?: number;
}

/**
 * Example Journey Template Structure (for documentation/validation)
 */
export const EXAMPLE_DENTAL_IMPLANT_JOURNEY: Partial<JourneyTemplate> = {
  name: "Dental Implant Protocol",
  description: "Standard 3-stage implant process with recovery monitoring",
  stages: [
    {
      order_index: 0,
      name: "Initial Consultation & CT Scan",
      type: "consultation",
      time_gap_days: 0,
      config: { duration_minutes: 60 }
    } as any,
    {
      order_index: 1,
      name: "Implant Placement Surgery",
      type: "treatment",
      time_gap_days: 14, // 2 weeks after consult (prep time)
      config: { duration_minutes: 90, required_resources: ["Surgery Room 1"] }
    } as any,
    {
      order_index: 2,
      name: "Post-Op Checkup (Day 1)",
      type: "followup_manual",
      time_gap_days: 1, // 1 day after surgery
      config: { staff_instructions: "Call patient. Check for bleeding/swelling. Confirm medication." }
    } as any,
    {
      order_index: 3,
      name: "Osseointegration Wait Period",
      type: "wait_period",
      time_gap_days: 0,
      config: { duration_minutes: 0 } // Just a marker for the gap
    } as any,
    {
      order_index: 4,
      name: "Crown Placement",
      type: "treatment",
      time_gap_days: 90, // 3 months later
      config: { duration_minutes: 60 }
    } as any
  ]
};

// ==========================================
// PATIENT JOURNEY TRACKING TYPES
// ==========================================

export type PatientJourneyStatus = 'active' | 'completed' | 'cancelled' | 'on_hold';
export type StageProgressStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped';
export type DelayStatus = 'none' | 'mild' | 'high_risk';

export type PatientJourney = Database['public']['Tables']['patient_journeys']['Row'] & {
  template?: JourneyTemplate;
  current_stage?: JourneyStage;
};

export type PatientJourneyStage = Database['public']['Tables']['patient_journey_stages']['Row'] & {
  definition?: JourneyStage;
};

export interface StuckJourney {
  journey_id: string;
  patient_id: string;
  clinic_id: string;
  stage_id: string;
  stage_name: string;
  delay_status: DelayStatus;
  days_overdue: number;
  patient_name: string;
  patient_phone: string;
  automation_enabled: boolean;
  suggested_action: 'call_patient' | 'monitor' | 'escalate';
}

export type JourneyTransition = Database['public']['Tables']['journey_transitions']['Row'];
