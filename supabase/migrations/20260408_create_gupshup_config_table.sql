-- Migration: Create Gupshup Configuration Table
-- Date: 2026-04-08
-- Purpose: Store per-clinic Gupshup WhatsApp credentials and status

CREATE TABLE IF NOT EXISTS public.gupshup_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    -- Gupshup Credentials
    app_id TEXT NOT NULL,
    app_token TEXT NOT NULL,
    api_key TEXT NOT NULL,
    phone_number_id TEXT NOT NULL,
    
    -- Status Tracking
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'registering', 'verified', 'active', 'error')),
    error_message TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    
    -- Activity Tracking
    registered_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_message_sent_at TIMESTAMP WITH TIME ZONE,
    last_webhook_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(clinic_id)
);

-- Enable Row Level Security
ALTER TABLE public.gupshup_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clinic owners can only see their own config
CREATE POLICY "Clinic staff can view own Gupshup config"
ON public.gupshup_config FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.clinic_id = gupshup_config.clinic_id
        AND staff.user_id = auth.uid()
    )
);

-- RLS Policy: Only clinic owners can update their config
CREATE POLICY "Clinic owners can update own Gupshup config"
ON public.gupshup_config FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.clinic_id = gupshup_config.clinic_id
        AND staff.user_id = auth.uid()
        AND staff.role = 'owner'
    )
);

-- RLS Policy: Only clinic owners can insert new config
CREATE POLICY "Clinic owners can insert own Gupshup config"
ON public.gupshup_config FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.staff
        WHERE staff.clinic_id = gupshup_config.clinic_id
        AND staff.user_id = auth.uid()
        AND staff.role = 'owner'
    )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gupshup_config_clinic_id ON public.gupshup_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_gupshup_config_status ON public.gupshup_config(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_gupshup_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gupshup_config_updated_at ON public.gupshup_config;
CREATE TRIGGER trigger_gupshup_config_updated_at
BEFORE UPDATE ON public.gupshup_config
FOR EACH ROW
EXECUTE FUNCTION public.update_gupshup_config_updated_at();
