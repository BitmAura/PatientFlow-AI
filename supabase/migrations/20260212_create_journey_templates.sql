-- ==========================================
-- JOURNEY TEMPLATES (Treatment Pathways)
-- ==========================================

-- 1. Journey Templates Table
-- Defines the high-level reusable pathway (e.g., "Dental Implant Protocol")
CREATE TABLE public.journey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Journey Stages Table
-- Defines the ordered steps within a journey
CREATE TABLE public.journey_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.journey_templates(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL, -- e.g., "Initial Consultation", "Surgery Day", "Post-Op Check"
    order_index INTEGER NOT NULL, -- 0, 1, 2...
    
    -- Time Gap: How long after the *previous* stage should this happen?
    -- For the first stage (index 0), this is usually 0 (starts immediately)
    time_gap_days INTEGER DEFAULT 0,
    
    -- Stage Type: Determines the system behavior
    type TEXT NOT NULL CHECK (type IN ('consultation', 'treatment', 'followup_auto', 'followup_manual', 'wait_period')),
    
    -- Configuration for the stage behavior
    -- Example for 'followup_auto': { "message_template": "Hi...", "channel": "whatsapp" }
    -- Example for 'followup_manual': { "staff_instructions": "Call patient to check swelling" }
    config JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(template_id, order_index) -- Prevent duplicate steps at same index
);

-- 3. Indexes
CREATE INDEX idx_journey_templates_clinic ON journey_templates(clinic_id);
CREATE INDEX idx_journey_stages_template ON journey_stages(template_id);
