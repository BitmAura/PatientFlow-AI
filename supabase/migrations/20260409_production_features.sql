-- 1. WhatsApp Template Management
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    body_text TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    gupshup_template_id TEXT,
    meta_status TEXT DEFAULT 'PENDING' CHECK (meta_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    last_checked_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, name)
);

-- 2. WhatsApp Message Queue
CREATE TABLE IF NOT EXISTS public.message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    message_body TEXT NOT NULL,
    template_id UUID REFERENCES public.whatsapp_templates(id),
    message_type TEXT NOT NULL, -- e.g. 'recall', 'reminder_2h'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'expired')),
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- 3. Update existing patient_messages for session tracking
ALTER TABLE public.patient_messages 
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS message_id_external TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Patient Consent (Opt-in)
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL;

-- 5. Cron Health Monitoring
CREATE TABLE IF NOT EXISTS public.cron_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cron_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('success', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_runs ENABLE ROW LEVEL SECURITY;

-- Basic RLS for new tables
CREATE POLICY "Clinic staff can manage templates" ON public.whatsapp_templates
FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Clinic staff can view queue" ON public.message_queue
FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- JSONB Append helper for logging
CREATE OR REPLACE FUNCTION append_jsonb(target_id UUID, table_name TEXT, col_name TEXT, payload JSONB)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I || %L::jsonb WHERE id = %L', 
                 table_name, col_name, col_name, payload::text, target_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
