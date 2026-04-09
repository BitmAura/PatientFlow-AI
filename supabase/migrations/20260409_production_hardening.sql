-- Production Hardening Migration
-- Date: 2026-04-09

-- 1. Global Blacklist for cross-clinic opt-outs
CREATE TABLE IF NOT EXISTS public.global_blacklist (
    phone TEXT PRIMARY KEY,
    reason TEXT DEFAULT 'opt_out',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Staff Tasks for Risk Workflow
CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL, -- 'call_high_risk', 'lead_followup'
    due_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Subscriptions for Starter/Growth/Pro
-- First, drop the old constraint if it exists
DO $$
BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Update plan_id for existing rows to map to new tiers
UPDATE public.subscriptions SET plan_id = 'starter' WHERE plan_id = 'clinic';
UPDATE public.subscriptions SET plan_id = 'growth' WHERE plan_id = 'hospital';

-- Add the new constraint
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_id_check 
CHECK (plan_id IN ('starter', 'growth', 'pro'));

-- 4. Risk Log in Appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS risk_score_log JSONB DEFAULT '[]'::jsonb;

-- 5. Atomic Counter Functions for Quotas
CREATE OR REPLACE FUNCTION increment_subscription_usage(
  p_subscription_id UUID,
  p_appointments_increment INTEGER DEFAULT 0,
  p_whatsapp_increment INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.subscription_usage (
    subscription_id,
    period_start,
    period_end,
    appointments_count,
    whatsapp_messages_sent
  )
  SELECT 
    id, 
    current_period_start, 
    current_period_end, 
    p_appointments_increment, 
    p_whatsapp_increment
  FROM public.subscriptions
  WHERE id = p_subscription_id
  ON CONFLICT (subscription_id, period_start) -- Assumes unique constraint on these two
  DO UPDATE SET
    appointments_count = subscription_usage.appointments_count + p_appointments_increment,
    whatsapp_messages_sent = subscription_usage.whatsapp_messages_sent + p_whatsapp_increment,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS on new tables
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_blacklist ENABLE ROW LEVEL SECURITY;

-- Policies for staff_tasks
CREATE POLICY "Staff can view their clinic tasks" ON public.staff_tasks
FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can update their clinic tasks" ON public.staff_tasks
FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- Global blacklist is read-only for clinics
CREATE POLICY "Clinics can see blacklist" ON public.global_blacklist
FOR SELECT USING (true);

-- 7. Double-Booking Prevention Index
-- Constraint to ensure a doctor cannot be double-booked
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_book_doc 
ON public.appointments (doctor_id, start_time) 
WHERE status != 'cancelled' AND doctor_id IS NOT NULL;

-- Constraint for clinic-level resources (if doctor is null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_book_clinic 
ON public.appointments (clinic_id, start_time) 
WHERE status != 'cancelled' AND doctor_id IS NULL;
