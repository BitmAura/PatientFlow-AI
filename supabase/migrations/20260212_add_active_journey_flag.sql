-- ==========================================
-- ACTIVE JOURNEY GUARD & OWNERSHIP BOUNDARIES
-- ==========================================

-- 1. Add State Flags to Patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS has_active_journey BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_journey_end_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_patients_active_journey ON public.patients(has_active_journey);

-- 2. Trigger Function to Maintain State
CREATE OR REPLACE FUNCTION public.sync_patient_journey_status()
RETURNS TRIGGER AS $$
BEGIN
  -- CASE: Journey Created or Reactivated (Active)
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active') THEN
     
    UPDATE public.patients
    SET has_active_journey = TRUE
    WHERE id = NEW.patient_id;
  
  -- CASE: Journey Completed or Dropped
  ELSIF (TG_OP = 'UPDATE' AND NEW.status IN ('completed', 'dropped') AND OLD.status = 'active') THEN
    
    UPDATE public.patients
    SET has_active_journey = FALSE,
        last_journey_end_at = NOW()
    WHERE id = NEW.patient_id;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trg_sync_patient_journey_status ON public.patient_journeys;

CREATE TRIGGER trg_sync_patient_journey_status
AFTER INSERT OR UPDATE OF status ON public.patient_journeys
FOR EACH ROW
EXECUTE FUNCTION public.sync_patient_journey_status();

-- 4. Backfill (Optional but good for consistency)
-- Ensure existing active journeys mark patients as active
UPDATE public.patients p
SET has_active_journey = TRUE
FROM public.patient_journeys pj
WHERE p.id = pj.patient_id AND pj.status = 'active';
