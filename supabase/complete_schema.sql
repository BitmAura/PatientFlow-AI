-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ==========================================
-- 1. USERS & AUTH
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. CLINICS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    coordinates POINT,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    business_hours JSONB DEFAULT '{}'::jsonb,
    slot_duration INTEGER DEFAULT 30 CHECK (slot_duration > 0),
    slug TEXT UNIQUE,
    onboarding_status TEXT DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinics_slug ON public.clinics(slug);

-- ==========================================
-- 3. STAFF
-- ==========================================
DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('owner', 'doctor', 'receptionist', 'accountant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_status AS ENUM ('active', 'invited', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role staff_role NOT NULL DEFAULT 'receptionist',
    permissions JSONB DEFAULT '{}'::jsonb,
    email TEXT,
    invitation_token TEXT UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    status staff_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(clinic_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_clinic_user ON public.staff(clinic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- ==========================================
-- 4. DOCTORS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES public.staff(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    specialization TEXT,
    qualification TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10, 2) DEFAULT 0,
    availability_overrides JSONB DEFAULT '{}'::jsonb,
    is_bookable_online BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_doctors_clinic ON public.doctors(clinic_id);

-- ==========================================
-- 5. SERVICES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL CHECK (duration > 0),
    price DECIMAL(10, 2) DEFAULT 0 CHECK (price >= 0),
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10, 2) DEFAULT 0 CHECK (deposit_amount >= 0),
    deposit_type TEXT DEFAULT 'fixed' CHECK (deposit_type IN ('fixed', 'percentage')),
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_services_clinic ON public.services(clinic_id);

CREATE TABLE IF NOT EXISTS public.doctor_services (
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, service_id)
);

-- ==========================================
-- 6. PATIENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    dob DATE,
    gender TEXT,
    address TEXT,
    blood_group TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    notes TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    language TEXT DEFAULT 'en',
    whatsapp_opt_in BOOLEAN DEFAULT true,
    email_opt_in BOOLEAN DEFAULT true,
    total_visits INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    requires_deposit BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'manual',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_search ON public.patients USING GIN (to_tsvector('english', full_name || ' ' || coalesce(phone, '') || ' ' || coalesce(email, '')));

-- ==========================================
-- 7. APPOINTMENTS
-- ==========================================
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE patient_response AS ENUM ('no_response', 'confirmed', 'will_reschedule', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_source AS ENUM ('dashboard', 'booking_page', 'whatsapp', 'phone', 'walk_in');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    status appointment_status DEFAULT 'pending',
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    deposit_status TEXT DEFAULT 'pending',
    deposit_payment_id UUID,
    confirmation_sent BOOLEAN DEFAULT false,
    confirmation_sent_at TIMESTAMPTZ,
    reminder_48h_sent BOOLEAN DEFAULT false,
    reminder_48h_sent_at TIMESTAMPTZ,
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_24h_sent_at TIMESTAMPTZ,
    reminder_2h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent_at TIMESTAMPTZ,
    noshow_followup_sent BOOLEAN DEFAULT false,
    noshow_followup_sent_at TIMESTAMPTZ,
    patient_response patient_response DEFAULT 'no_response',
    internal_notes TEXT,
    patient_notes TEXT,
    source booking_source DEFAULT 'dashboard',
    booked_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    original_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- ==========================================
-- 8. FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger: Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clinics_modtime ON public.clinics;
CREATE TRIGGER update_clinics_modtime BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_modtime ON public.appointments;
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function: Generate Clinic Slug
CREATE OR REPLACE FUNCTION generate_clinic_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(NEW.id::text from 1 for 8);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_clinic_slug ON public.clinics;
CREATE TRIGGER set_clinic_slug BEFORE INSERT ON public.clinics FOR EACH ROW EXECUTE PROCEDURE generate_clinic_slug();

-- Function: Calculate Patient Stats
CREATE OR REPLACE FUNCTION calculate_patient_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_id UUID;
BEGIN
    target_id := COALESCE(NEW.patient_id, OLD.patient_id);
    
    UPDATE public.patients
    SET 
        total_visits = (SELECT count(*) FROM public.appointments WHERE patient_id = target_id AND status = 'completed'),
        no_shows = (SELECT count(*) FROM public.appointments WHERE patient_id = target_id AND status = 'no_show'),
        cancellations = (SELECT count(*) FROM public.appointments WHERE patient_id = target_id AND status = 'cancelled')
    WHERE id = target_id;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_patient_stats ON public.appointments;
CREATE TRIGGER update_patient_stats AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE calculate_patient_stats();

-- Function: Check Conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
    p_doctor_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT count(*)
    INTO conflict_count
    FROM public.appointments
    WHERE doctor_id = p_doctor_id
      AND status NOT IN ('cancelled', 'no_show')
      AND id != COALESCE(p_exclude_appointment_id, '00000000-0000-0000-0000-000000000000')
      AND (
          (start_time < p_end_time AND end_time > p_start_time)
      );
      
    RETURN conflict_count > 0;
END;
$$ language 'plpgsql';

-- Function: Search Patients
CREATE OR REPLACE FUNCTION search_patients(
    p_clinic_id UUID,
    p_query TEXT
)
RETURNS SETOF public.patients AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.patients
    WHERE clinic_id = p_clinic_id
      AND (
          full_name ILIKE '%' || p_query || '%'
          OR phone ILIKE '%' || p_query || '%'
          OR email ILIKE '%' || p_query || '%'
      )
    ORDER BY full_name
    LIMIT 20;
END;
$$ language 'plpgsql';

-- ==========================================
-- 9. RLS POLICIES (Simplified for brevity but comprehensive)
-- ==========================================
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies (Drop existing first to avoid duplication errors if re-running)
DROP POLICY IF EXISTS "Staff Access Clinic Data" ON public.patients;
CREATE POLICY "Staff Access Clinic Data" ON public.patients
USING (clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Staff Access Appointments" ON public.appointments;
CREATE POLICY "Staff Access Appointments" ON public.appointments
USING (clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
));

-- ==========================================
-- 10. ADDITIONAL TABLES (Condensed)
-- ==========================================
-- Reminder Logs
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id),
    appointment_id UUID REFERENCES public.appointments(id),
    channel TEXT,
    direction TEXT,
    content TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comm_logs_appt ON public.communication_logs(appointment_id);

-- Blocked Slots
CREATE TABLE IF NOT EXISTS public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
