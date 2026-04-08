-- Migration: Create Patient Messages Table
-- Date: 2026-04-08
-- Purpose: Store incoming WhatsApp messages from Gupshup

CREATE TABLE IF NOT EXISTS public.patient_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    
    -- Message Content
    phone_number TEXT NOT NULL, -- Sender's phone number
    content TEXT NOT NULL,
    
    -- Provider Information
    provider TEXT DEFAULT 'gupshup' NOT NULL CHECK (provider IN ('gupshup', 'meta', 'sms', 'email')),
    provider_message_id TEXT UNIQUE, -- Gupshup's unique message ID
    
    -- Message Metadata
    message_type TEXT DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'file', 'location')),
    raw_payload JSONB, -- Store raw webhook payload for debugging
    
    -- Processing Status
    status TEXT DEFAULT 'received' NOT NULL CHECK (status IN ('received', 'processing', 'processed', 'error')),
    error_message TEXT,
    
    -- AI Processing
    processed_by_ai BOOLEAN DEFAULT false,
    detected_intent TEXT, -- 'book_appointment', 'ask_price', 'complaint', 'inquiry', 'followup', etc.
    intent_confidence NUMERIC(3,2),
    ai_response TEXT,
    ai_response_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timing
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.patient_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clinic staff can view messages for their clinic
CREATE POLICY "Clinic staff can view own clinic messages"
ON public.patient_messages FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.staff
        WHERE staff.user_id = auth.uid()
    )
);

-- RLS Policy: Service can update messages (for processing)
-- Note: This is intentionally open for backend service to update processing status
CREATE POLICY "Backend service can update messages"
ON public.patient_messages FOR UPDATE
USING (true); -- Backend uses service role key

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_messages_clinic_id ON public.patient_messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient_id ON public.patient_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_phone ON public.patient_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_patient_messages_provider_id ON public.patient_messages(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_status ON public.patient_messages(status);
CREATE INDEX IF NOT EXISTS idx_patient_messages_created_at ON public.patient_messages(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_patient_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_patient_messages_updated_at ON public.patient_messages;
CREATE TRIGGER trigger_patient_messages_updated_at
BEFORE UPDATE ON public.patient_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_patient_messages_updated_at();
