-- ==========================================
-- 14. LEADS (Pre-booking CRM)
-- ==========================================

CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE lead_source AS ENUM ('facebook_ad', 'google_ad', 'website', 'referral', 'manual');

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    
    source lead_source DEFAULT 'manual',
    status lead_status DEFAULT 'new',
    
    interest TEXT, -- e.g. "Dental Implant"
    notes TEXT,
    
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    next_followup_at TIMESTAMP WITH TIME ZONE,
    
    converted_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    
    assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lead Activity Log (Calls, Notes, Status Changes)
CREATE TABLE public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL, -- 'note', 'call', 'status_change', 'whatsapp'
    content TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
