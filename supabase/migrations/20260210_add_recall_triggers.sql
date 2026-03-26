-- Migration: Add Triggers for Recall -> Appointment Conversion
-- Description: Automates lifecycle changes when appointments are booked or completed

-- ==========================================
-- 1. TRIGGER FUNCTION: Handle New Bookings
-- ==========================================
-- Logic: When an appointment is created, check if patient has a pending recall.
-- If yes, "convert" the recall to booked and stop the nagging.

CREATE OR REPLACE FUNCTION handle_appointment_booking()
RETURNS TRIGGER AS $$
DECLARE
    open_recall_id UUID;
BEGIN
    -- 1. Find the most relevant open recall for this patient
    -- We look for 'pending', 'overdue', or 'contacted' recalls
    -- (We ignore 'booked' or 'completed' as they are already handled)
    SELECT id INTO open_recall_id
    FROM public.patient_recalls
    WHERE patient_id = NEW.patient_id
      AND status IN ('pending', 'overdue', 'contacted')
    ORDER BY recall_due_date ASC
    LIMIT 1;

    -- 2. If an open recall exists, attribute this booking to it
    IF open_recall_id IS NOT NULL THEN
        -- A. Update Recall Status -> 'booked'
        -- This immediately stops the cron job / automation from picking it up
        UPDATE public.patient_recalls
        SET 
            status = 'booked',
            updated_at = NOW(),
            notes = COALESCE(notes, '') || E'\n[System] Auto-converted via Appointment Booking'
        WHERE id = open_recall_id;

        -- B. Log the Conversion Activity
        INSERT INTO public.recall_activities (
            recall_id, 
            activity_type, 
            notes, 
            created_at
        ) VALUES (
            open_recall_id,
            'booking_made',
            'Appointment booked. Source: Automatic System Trigger',
            NOW()
        );

        -- C. Update Patient Lifecycle -> 'recall_booked'
        UPDATE public.patients
        SET lifecycle_stage = 'recall_booked'
        WHERE id = NEW.patient_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger on Appointments (INSERT)
DROP TRIGGER IF EXISTS trigger_appointment_booking ON public.appointments;
CREATE TRIGGER trigger_appointment_booking
    AFTER INSERT ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION handle_appointment_booking();


-- ==========================================
-- 2. TRIGGER FUNCTION: Handle Completed Visits
-- ==========================================
-- Logic: When an appointment is marked 'completed', reset the cycle.

CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
    linked_recall_id UUID;
BEGIN
    -- Only run if status changed to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        
        -- 1. Update Patient State -> 'visited'
        -- This effectively "resets" them for the next cycle (e.g. 6 months from now)
        UPDATE public.patients
        SET 
            lifecycle_stage = 'visited',
            -- Optional: Update last_visit_date if you store it on patients table
            -- last_visit_date = NEW.start_time::DATE
            updated_at = NOW()
        WHERE id = NEW.patient_id;

        -- 2. Close out any 'booked' recalls as 'completed'
        -- This keeps our data clean
        UPDATE public.patient_recalls
        SET status = 'completed', updated_at = NOW()
        WHERE patient_id = NEW.patient_id
          AND status = 'booked';
          
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger on Appointments (UPDATE)
DROP TRIGGER IF EXISTS trigger_appointment_completion ON public.appointments;
CREATE TRIGGER trigger_appointment_completion
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION handle_appointment_completion();
