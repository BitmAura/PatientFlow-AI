-- Migration: Create reminder_settings table
-- Date: 2026-04-09
-- Purpose: Store per-clinic reminder configuration and custom templates
--          so each clinic can enable/disable reminder types and customise wording.

CREATE TABLE IF NOT EXISTS public.reminder_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  config      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(clinic_id)
);

-- Index for fast per-clinic lookup
CREATE INDEX IF NOT EXISTS idx_reminder_settings_clinic ON public.reminder_settings(clinic_id);

-- Enable Row Level Security
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Clinic staff can read their own settings
CREATE POLICY "Clinic staff can read own reminder settings"
ON public.reminder_settings FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE staff.user_id = auth.uid()
  )
);

-- Clinic owners can write settings
CREATE POLICY "Clinic owners can upsert reminder settings"
ON public.reminder_settings FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff
    WHERE staff.user_id = auth.uid() AND staff.role = 'owner'
  )
)
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.staff
    WHERE staff.user_id = auth.uid() AND staff.role = 'owner'
  )
);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION public.update_reminder_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reminder_settings_updated_at ON public.reminder_settings;
CREATE TRIGGER trigger_reminder_settings_updated_at
  BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_reminder_settings_updated_at();
