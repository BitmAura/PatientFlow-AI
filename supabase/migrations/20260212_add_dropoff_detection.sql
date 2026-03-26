-- ==========================================
-- DROP-OFF DETECTION ENGINE
-- ==========================================

-- 1. Update Template Definition
-- Add max_delay_days to define when a stage is considered "stuck"
ALTER TABLE public.journey_stages 
ADD COLUMN IF NOT EXISTS max_delay_days INTEGER DEFAULT 3; -- Default 3 days before flagging

-- 2. Update Patient Journey Stages
-- Track when we expect this stage to finish and its delay status
ALTER TABLE public.patient_journey_stages 
ADD COLUMN IF NOT EXISTS expected_completion_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delay_status TEXT CHECK (delay_status IN ('none', 'mild', 'high_risk')) DEFAULT 'none';

-- 3. Indexes for Detection Performance
CREATE INDEX IF NOT EXISTS idx_journey_stages_completion ON public.patient_journey_stages(expected_completion_at) 
WHERE status = 'in_progress';

CREATE INDEX IF NOT EXISTS idx_journey_stages_delay ON public.patient_journey_stages(delay_status) 
WHERE status = 'in_progress';

-- 4. Automation Trigger: Auto-calculate expected_completion_at
CREATE OR REPLACE FUNCTION set_stage_expected_completion() 
RETURNS TRIGGER AS $$
BEGIN
    -- Only set if status is changing to 'in_progress' and expected_completion_at is not manually provided
    IF NEW.status = 'in_progress' AND (OLD.status IS DISTINCT FROM 'in_progress') AND NEW.expected_completion_at IS NULL THEN
        -- Look up max_delay_days from the template definition
        NEW.expected_completion_at := NOW() + ((
            SELECT COALESCE(max_delay_days, 3) 
            FROM public.journey_stages 
            WHERE id = NEW.stage_id
        ) || ' days')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_expected_completion ON public.patient_journey_stages;
CREATE TRIGGER trigger_set_expected_completion
    BEFORE INSERT OR UPDATE ON public.patient_journey_stages
    FOR EACH ROW
    EXECUTE FUNCTION set_stage_expected_completion();
