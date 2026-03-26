-- ==========================================
-- SNOOZE LIMIT ENFORCEMENT
-- ==========================================

-- 1. Add snooze_count to patient_journeys
ALTER TABLE public.patient_journeys
ADD COLUMN IF NOT EXISTS snooze_count INTEGER DEFAULT 0;
