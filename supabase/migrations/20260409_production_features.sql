-- Migration: Production Features for PatientFlow AI
-- Date: 2026-04-09
-- Purpose: Add Risk Scoring, Shared Number Mode, and CRM flags

-- 1. Add Risk Score to Appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS no_show_risk_score INTEGER DEFAULT 0;

-- 2. Add Shared Number Toggle to Clinics
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS use_shared_number BOOLEAN DEFAULT TRUE;
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS google_review_url TEXT;

-- 3. Add Opt-Out Flag to Patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT FALSE;

-- 4. Create Morning Briefs Table
CREATE TABLE IF NOT EXISTS public.morning_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    stats JSONB NOT NULL,
    status TEXT DEFAULT 'sent',
    channel TEXT DEFAULT 'whatsapp'
);

-- Enable RLS on morning_briefs
ALTER TABLE public.morning_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can view morning briefs" ON public.morning_briefs FOR SELECT
USING (
  clinic_id IN (
    SELECT s.clinic_id FROM public.staff s WHERE s.user_id = auth.uid() AND s.role = 'owner'
  )
);

-- 5. Add idempotency check to patient_messages
ALTER TABLE public.patient_messages
ADD COLUMN IF NOT EXISTS message_id_external TEXT UNIQUE;
