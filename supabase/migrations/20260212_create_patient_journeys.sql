-- ==========================================
-- PATIENT JOURNEY TRACKING
-- ==========================================

-- 1. Patient Journeys Table
-- Represents a specific instance of a template assigned to a patient
CREATE TABLE public.patient_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.journey_templates(id) ON DELETE SET NULL,
    
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')) DEFAULT 'active',
    
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE, -- When the entire journey was finished
    
    current_stage_id UUID, -- References journey_stages(id), denormalized for quick access
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patient Journey Stages (History & Progress)
-- Tracks the status of each specific stage for this patient
CREATE TABLE public.patient_journey_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES public.patient_journeys(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE NOT NULL, -- The template definition
    
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped')) DEFAULT 'scheduled',
    
    scheduled_date TIMESTAMP WITH TIME ZONE, -- When it was planned to happen
    started_at TIMESTAMP WITH TIME ZONE, -- Actual start
    completed_at TIMESTAMP WITH TIME ZONE, -- Actual completion
    
    notes TEXT, -- Clinical notes or staff comments for this stage
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(journey_id, stage_id) -- One record per stage definition per journey
);

-- 3. Journey Transitions (Audit Log)
-- Immutable log of every state change
CREATE TABLE public.journey_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES public.patient_journeys(id) ON DELETE CASCADE NOT NULL,
    
    from_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
    to_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL, -- 'start', 'complete', 'skip', 'cancel', 'resume'
    actor_id UUID, -- Could be a user_id or system (null)
    
    meta JSONB DEFAULT '{}'::jsonb, -- Store snapshot of data or automated triggers fired
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_patient_journeys_patient ON patient_journeys(patient_id);
CREATE INDEX idx_patient_journeys_status ON patient_journeys(status);
CREATE INDEX idx_patient_journey_stages_journey ON patient_journey_stages(journey_id);
CREATE INDEX idx_journey_transitions_journey ON journey_transitions(journey_id);
