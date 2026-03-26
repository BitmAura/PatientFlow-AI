-- Migration: Patient Recall & Revenue Recovery Engine
-- Description: Adds lifecycle states, recall tracking, and activity logging.

-- ==========================================
-- 1. ENUMS
-- ==========================================

DO $$ BEGIN
    CREATE TYPE patient_lifecycle_stage AS ENUM (
        'new_patient',
        'visited',
        'treatment_completed',
        'recall_due',
        'recall_not_responded',
        'recall_booked',
        'inactive',
        'opted_out'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recall_status AS ENUM (
        'pending',
        'overdue',
        'contacted',
        'booked',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recall_activity_type AS ENUM (
        'message_sent',
        'staff_call',
        'patient_response',
        'booking_made',
        'opt_out'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. MODIFY PATIENTS TABLE
-- ==========================================

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS lifecycle_stage patient_lifecycle_stage DEFAULT 'new_patient';

CREATE INDEX IF NOT EXISTS idx_patients_lifecycle ON public.patients(lifecycle_stage);

-- ==========================================
-- 3. PATIENT RECALLS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.patient_recalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    treatment_category TEXT NOT NULL DEFAULT 'general', -- e.g., 'dental', 'hygiene', 'checkup'
    last_visit_date DATE,
    recall_due_date DATE NOT NULL,
    status recall_status DEFAULT 'pending',
    attempt_count INTEGER DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recalls_clinic_status ON public.patient_recalls(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_recalls_due_date ON public.patient_recalls(recall_due_date);
CREATE INDEX IF NOT EXISTS idx_recalls_patient ON public.patient_recalls(patient_id);

-- RLS Policies
ALTER TABLE public.patient_recalls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Access Recalls" ON public.patient_recalls;
CREATE POLICY "Staff Access Recalls" ON public.patient_recalls
USING (clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_recalls_modtime ON public.patient_recalls;
CREATE TRIGGER update_recalls_modtime BEFORE UPDATE ON public.patient_recalls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 4. RECALL ACTIVITIES LOG
-- ==========================================

CREATE TABLE IF NOT EXISTS public.recall_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recall_id UUID REFERENCES public.patient_recalls(id) ON DELETE CASCADE NOT NULL,
    activity_type recall_activity_type NOT NULL,
    performed_by UUID REFERENCES public.staff(id) ON DELETE SET NULL, -- Null implies system automation
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recall_activities_recall ON public.recall_activities(recall_id);

-- RLS Policies
ALTER TABLE public.recall_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Access Recall Activities" ON public.recall_activities;
CREATE POLICY "Staff Access Recall Activities" ON public.recall_activities
USING (recall_id IN (
    SELECT id FROM public.patient_recalls WHERE clinic_id IN (
        SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    )
));

-- ==========================================
-- 5. HELPER FUNCTIONS
-- ==========================================

-- Function to automatically set patient to 'recall_due' when a recall becomes due
CREATE OR REPLACE FUNCTION check_recall_due_status()
RETURNS void AS $$
BEGIN
    -- Update recalls that are due today and pending
    UPDATE public.patient_recalls
    SET status = 'overdue'
    WHERE recall_due_date < CURRENT_DATE 
      AND status = 'pending';
      
    -- Update patient lifecycle if they have due recalls
    UPDATE public.patients p
    SET lifecycle_stage = 'recall_due'
    WHERE id IN (
        SELECT patient_id 
        FROM public.patient_recalls 
        WHERE status IN ('pending', 'overdue')
    )
    AND lifecycle_stage NOT IN ('recall_due', 'recall_not_responded', 'recall_booked', 'opted_out');
END;
$$ language 'plpgsql';

-- Function to increment recall attempts and update status
CREATE OR REPLACE FUNCTION increment_recall_attempts(recall_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.patient_recalls
    SET 
        attempt_count = attempt_count + 1,
        last_contacted_at = NOW(),
        status = 'contacted'
    WHERE id = recall_id_param;
END;
$$ language 'plpgsql';
