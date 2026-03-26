-- ==========================================
-- JOURNEY AUTOMATION LOCK
-- ==========================================

-- 1. Add Automation Lock to Patient Journeys (Global Lock)
ALTER TABLE public.patient_journeys
ADD COLUMN IF NOT EXISTS automation_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS automation_locked_at TIMESTAMP WITH TIME ZONE;

-- 2. Index for Automation Engine Performance
-- Helps the engine quickly skip locked journeys
CREATE INDEX IF NOT EXISTS idx_patient_journeys_automation 
ON public.patient_journeys(automation_locked)
WHERE status = 'active';
