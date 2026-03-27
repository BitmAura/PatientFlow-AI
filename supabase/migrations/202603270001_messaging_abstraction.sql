-- Multi-tenant messaging abstraction schema
-- Adds provider-independent config and logs for scale.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'whatsapp_provider' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.whatsapp_provider AS ENUM ('gupshup', 'meta');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'automation_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.automation_status AS ENUM ('success', 'failed', 'skipped');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  provider public.whatsapp_provider NOT NULL DEFAULT 'gupshup',
  phone_number TEXT,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (clinic_id)
);

CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  provider public.whatsapp_provider NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  message_id TEXT,
  status public.message_status NOT NULL DEFAULT 'pending',
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_phone TEXT,
  status public.automation_status NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_message_logs_clinic_created ON public.message_logs (clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_message_id ON public.message_logs (message_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_phone ON public.message_logs (clinic_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_automation_logs_clinic_created ON public.automation_logs (clinic_id, created_at DESC);

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view whatsapp configs" ON public.whatsapp_configs;
CREATE POLICY "Staff can view whatsapp configs"
  ON public.whatsapp_configs FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage whatsapp configs" ON public.whatsapp_configs;
CREATE POLICY "Owners can manage whatsapp configs"
  ON public.whatsapp_configs FOR ALL
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

DROP POLICY IF EXISTS "Staff can view message logs" ON public.message_logs;
CREATE POLICY "Staff can view message logs"
  ON public.message_logs FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert message logs" ON public.message_logs;
CREATE POLICY "Staff can insert message logs"
  ON public.message_logs FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can view automation logs" ON public.automation_logs;
CREATE POLICY "Staff can view automation logs"
  ON public.automation_logs FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff can insert automation logs" ON public.automation_logs;
CREATE POLICY "Staff can insert automation logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));
