import { SupabaseClient } from '@supabase/supabase-js';
import { RecallService } from '@/services/recall-service';

export interface ImportPatientRecord {
  id: string;
  clinic_id: string;
  last_visit_at?: string;
  treatment_type?: string;
  lifecycle_stage?: string;
}

/**
 * Post-CSV Import Processor
 * Enforces discipline on newly ingested data.
 */
export async function processImportedPatients(
  supabase: SupabaseClient,
  clinicId: string,
  patients: ImportPatientRecord[]
) {
  for (const patient of patients) {
    try {
      // 1. Assign Basic Lifecycle Stage
      // Default to 'visited' if we have a last_visit, else 'new'
      let stage: 'new_patient' | 'visited' | 'recall_due' = 'new_patient';
      
      if (patient.last_visit_at) {
        stage = 'visited';
      }

      // 2. Automate Recall Enrollment
      // If visit was > 6 months ago, enroll in recall
      if (patient.last_visit_at) {
        const lastVisit = new Date(patient.last_visit_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (lastVisit < sixMonthsAgo) {
          // Schedule recall for 1 week from now (immediate recovery)
          const nextRecall = new Date();
          nextRecall.setDate(nextRecall.getDate() + 7);
          
          await RecallService.enrollPatient(
            supabase,
            clinicId,
            patient.id,
            patient.treatment_type || 'General Checkup',
            nextRecall.toISOString()
          );
          stage = 'recall_due';
        }
      }

      // Update the patient record with the derived stage
      await supabase.from('patients')
        .update({ lifecycle_stage: stage } as any)
        .eq('id', patient.id);

    } catch (error) {
      console.error(`[ImportProcessor] Failed to process patient ${patient.id}:`, error);
    }
  }
}
