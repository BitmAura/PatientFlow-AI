-- Migration: Update Recall Engine to Enforce Cooldown Period
-- Description: Prevents immediate recreation of recalls after cancellation

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
            AND (
                -- Option 1: If patients has last_visit_date
                p.last_visit_date <= cutoff_date_param
                OR
                -- Option 2: Look at last completed appointment
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

            -- D. COOLDOWN CHECK: No recent recalls for this category
            -- This covers active ones (pending/overdue) AND recently cancelled ones
            AND NOT EXISTS (
                SELECT 1 FROM public.patient_recalls pr
                WHERE pr.patient_id = p.id
                AND pr.treatment_category = treatment_category_param
                -- Block if ANY recall exists created in the last 30 days
                -- This effectively enforces "One cycle per month" and respects cancellations
                AND pr.created_at > (NOW() - INTERVAL '30 days')
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
    SELECT id, 'message_sent', 'System: Identified as Recall Due' 
    FROM inserted_recalls;

    -- 4. Update Patient Lifecycle
    UPDATE public.patients
    SET lifecycle_stage = 'recall_due'
    WHERE id IN (SELECT patient_id FROM inserted_recalls);

    RETURN recalls_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
