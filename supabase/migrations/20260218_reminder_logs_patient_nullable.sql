-- Ensure reminder_logs exists and patient_id is nullable (so we can log messages to leads with no patient yet).
-- If the table was never created in your project, this creates it. If it exists, we only alter the column.

CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  phone TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_clinic_created ON public.reminder_logs(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_message_id ON public.reminder_logs(message_id) WHERE message_id IS NOT NULL;

-- If table already existed with NOT NULL patient_id, drop the constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reminder_logs' AND column_name = 'patient_id'
  ) THEN
    ALTER TABLE public.reminder_logs ALTER COLUMN patient_id DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
