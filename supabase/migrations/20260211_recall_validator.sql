-- Migration: Recall Lifecycle State Validator & Safety Constraints
-- Description: Enforces valid transitions and prevents data inconsistency

-- ==========================================
-- 1. STATE TRANSITION VALIDATOR
-- ==========================================
-- Enforces the logical flow: pending -> overdue -> contacted -> booked -> completed/cancelled

CREATE OR REPLACE FUNCTION validate_recall_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow same-status updates (e.g. updating notes or attempt_count)
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Define Valid Transitions
    -- 1. Pending -> Overdue, Cancelled
    IF OLD.status = 'pending' AND NEW.status IN ('overdue', 'cancelled') THEN
        RETURN NEW;
    END IF;

    -- 2. Overdue -> Contacted, Booked, Cancelled
    IF OLD.status = 'overdue' AND NEW.status IN ('contacted', 'booked', 'cancelled') THEN
        RETURN NEW;
    END IF;

    -- 3. Contacted -> Booked, Cancelled
    -- (Can stay 'contacted' via same-status check above)
    IF OLD.status = 'contacted' AND NEW.status IN ('booked', 'cancelled') THEN
        RETURN NEW;
    END IF;

    -- 4. Booked -> Completed, Cancelled (No-Show case)
    IF OLD.status = 'booked' AND NEW.status IN ('completed', 'cancelled') THEN
        RETURN NEW;
    END IF;

    -- 5. Cancelled/Completed -> Terminal states (No reopening allowed usually, but we permit 'pending' for manual reset)
    IF OLD.status IN ('cancelled', 'completed') AND NEW.status = 'pending' THEN
        RETURN NEW;
    END IF;

    -- If no rule matched, RAISE ERROR
    RAISE EXCEPTION 'Invalid recall status transition from % to %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

-- Attach Trigger
DROP TRIGGER IF EXISTS trigger_validate_recall_transition ON public.patient_recalls;
CREATE TRIGGER trigger_validate_recall_transition
    BEFORE UPDATE OF status ON public.patient_recalls
    FOR EACH ROW
    EXECUTE FUNCTION validate_recall_status_transition();


-- ==========================================
-- 2. SAFETY CONSTRAINT: SINGLE ACTIVE RECALL
-- ==========================================
-- Prevent multiple active recalls for the same treatment type per patient.
-- "Active" means: pending, overdue, contacted, booked.

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_recall 
ON public.patient_recalls (patient_id, treatment_category) 
WHERE status IN ('pending', 'overdue', 'contacted', 'booked');


-- ==========================================
-- 3. SAFETY TRIGGER: PREVENT OPTED-OUT RECALLS
-- ==========================================
-- Double-check to ensure we never create a recall for an opted-out patient

CREATE OR REPLACE FUNCTION check_patient_opt_out_on_insert()
RETURNS TRIGGER AS $$
DECLARE
    patient_lifecycle text;
BEGIN
    SELECT lifecycle_stage INTO patient_lifecycle
    FROM public.patients
    WHERE id = NEW.patient_id;

    IF patient_lifecycle = 'opted_out' THEN
        RAISE EXCEPTION 'Cannot create recall for opted-out patient';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_opt_out ON public.patient_recalls;
CREATE TRIGGER trigger_check_opt_out
    BEFORE INSERT ON public.patient_recalls
    FOR EACH ROW
    EXECUTE FUNCTION check_patient_opt_out_on_insert();
