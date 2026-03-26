-- Migration: Add Atomic Recall Processing Function
-- This function acts as the "Engine" for the daily cron job

CREATE OR REPLACE FUNCTION process_daily_recalls(
    treatment_category_param TEXT,
    cutoff_date_param DATE
)
RETURNS INTEGER AS $$
DECLARE
    recalls_created INTEGER := 0;
BEGIN
    -- 1. Identify Eligible Patients & Insert Recalls Atomically
    WITH eligible_patients AS (
        SELECT p.id as patient_id, p.clinic_id, p.last_visit_date
        FROM public.patients p
        WHERE 
            -- A. Patient is active
            p.lifecycle_stage NOT IN ('opted_out', 'inactive')
            
            -- B. Visit was long enough ago
            -- (Assuming patients table has last_visit_date, or we join appointments)
            -- For this design, we assume we rely on a tracked field or subquery
            AND (
                -- Option 1: If patients has last_visit_date
                p.last_visit_date <= cutoff_date_param
                OR
                -- Option 2: Look at last completed appointment (more robust)
                (
                    SELECT MAX(start_time)::DATE 
                    FROM public.appointments a 
                    WHERE a.patient_id = p.id AND a.status = 'completed'
                ) <= cutoff_date_param
            )

            -- C. NO future appointments booked
            AND NOT EXISTS (
                SELECT 1 FROM public.appointments a
                WHERE a.patient_id = p.id
                AND a.start_time > NOW()
                AND a.status NOT IN ('cancelled', 'no_show')
            )

            -- D. NO existing pending/overdue recall for this category
            AND NOT EXISTS (
                SELECT 1 FROM public.patient_recalls pr
                WHERE pr.patient_id = p.id
                AND pr.treatment_category = treatment_category_param
                AND pr.status IN ('pending', 'overdue', 'booked')
            )
    ),
    inserted_recalls AS (
        INSERT INTO public.patient_recalls (
            clinic_id,
            patient_id,
            treatment_category,
            last_visit_date,
            recall_due_date,
            status,
            attempt_count,
            created_at
        )
        SELECT 
            ep.clinic_id,
            ep.patient_id,
            treatment_category_param,
            -- Recalculate last visit for accuracy
            (
                SELECT MAX(start_time)::DATE 
                FROM public.appointments a 
                WHERE a.patient_id = ep.patient_id AND a.status = 'completed'
            ),
            CURRENT_DATE, -- Due today
            'pending',
            0,
            NOW()
        FROM eligible_patients ep
        RETURNING id, patient_id
    )
    
    -- 2. Log Activities & Update Counts
    SELECT count(*) INTO recalls_created FROM inserted_recalls;

    -- 3. Log the "Recall Created" activity for each
    INSERT INTO public.recall_activities (recall_id, activity_type, notes)
    SELECT id, 'message_sent', 'System: Identified as Recall Due' -- Using generic type or add 'system_identified' to enum
    FROM inserted_recalls;

    -- 4. Update Patient Lifecycle
    UPDATE public.patients
    SET lifecycle_stage = 'recall_due'
    WHERE id IN (SELECT patient_id FROM inserted_recalls);

    RETURN recalls_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
