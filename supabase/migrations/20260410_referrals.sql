-- Referral Viral Loop Schema
-- Track unique referral codes assigned to patients
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(clinic_id, patient_id)
);

-- Track actual patient referrals (Who referred whom)
CREATE TABLE IF NOT EXISTS public.referral_attributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    referrer_patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    referred_patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
    created_at TIMESTAMPTZ DEFAULT now(),
    converted_at TIMESTAMPTZ,
    UNIQUE(referred_patient_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON public.referral_links(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_attributions_referrer ON public.referral_attributions(referrer_patient_id);
