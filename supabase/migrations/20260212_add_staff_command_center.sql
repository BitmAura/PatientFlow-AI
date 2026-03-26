-- ==========================================
-- STAFF COMMAND CENTER SUPPORT
-- ==========================================

-- 1. Automation Control Flag
-- Allows staff to manually stop automation for a specific stage
ALTER TABLE public.patient_journey_stages 
ADD COLUMN IF NOT EXISTS automation_enabled BOOLEAN DEFAULT TRUE;

-- 2. Staff Action Tracking
-- We'll use the existing journey_transitions table, but let's ensure we have helpful indexes
CREATE INDEX IF NOT EXISTS idx_journey_transitions_action ON public.journey_transitions(action);

-- 3. View for Command Center (Optional, but helpful for complex joins)
-- Helps fetch "Stuck" journeys quickly
CREATE OR REPLACE VIEW view_stuck_journeys AS
SELECT 
    pj.id AS journey_id,
    pj.patient_id,
    pj.clinic_id,
    pjs.id AS stage_id,
    pjs.stage_id AS definition_id,
    js.name AS stage_name,
    pjs.delay_status,
    pjs.expected_completion_at,
    pjs.automation_enabled,
    EXTRACT(DAY FROM (NOW() - pjs.expected_completion_at)) AS days_overdue,
    p.full_name AS patient_name,
    p.phone AS patient_phone
FROM public.patient_journeys pj
JOIN public.patient_journey_stages pjs ON pj.id = pjs.journey_id
JOIN public.journey_stages js ON pjs.stage_id = js.id
JOIN public.patients p ON pj.patient_id = p.id
WHERE 
    pj.status = 'active'
    AND pjs.status = 'in_progress'
    AND (pjs.delay_status IN ('mild', 'high_risk') OR EXTRACT(DAY FROM (NOW() - pjs.expected_completion_at)) > 0);
