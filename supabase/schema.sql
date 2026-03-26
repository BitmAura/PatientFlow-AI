-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. USERS & AUTHENTICATION
-- ==========================================

-- Extends Supabase auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. CLINICS
-- ==========================================

CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    coordinates POINT, -- (latitude, longitude)
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    
    -- Business Hours (JSONB for flexibility: { "monday": { "open": "09:00", "close": "17:00", "breaks": [...] } })
    business_hours JSONB DEFAULT '{}'::jsonb,
    
    -- Slot Configuration
    slot_duration INTEGER DEFAULT 30, -- minutes
    
    slug TEXT UNIQUE, -- for booking page
    onboarding_status TEXT DEFAULT 'pending', -- pending, completed
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. STAFF (Link Users to Clinics)
-- ==========================================

CREATE TYPE staff_role AS ENUM ('owner', 'doctor', 'receptionist', 'accountant');
CREATE TYPE staff_status AS ENUM ('active', 'invited', 'disabled');

CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Can be null for pending invites
    
    role staff_role NOT NULL DEFAULT 'receptionist',
    permissions JSONB DEFAULT '{}'::jsonb, -- Granular permissions override
    
    -- Invitation tracking
    email TEXT, -- Used for invites
    invitation_token TEXT UNIQUE,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    
    status staff_status DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(clinic_id, user_id)
);

-- ==========================================
-- 4. DOCTORS (Extends Staff)
-- ==========================================

CREATE TABLE public.doctors (
    id UUID PRIMARY KEY REFERENCES public.staff(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    specialization TEXT,
    qualification TEXT,
    bio TEXT,
    consultation_fee NUMERIC(10, 2) DEFAULT 0,
    
    availability_overrides JSONB DEFAULT '{}'::jsonb, -- Specific dates/times different from clinic hours
    
    is_bookable_online BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. SERVICES
-- ==========================================

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- minutes
    price NUMERIC(10, 2) DEFAULT 0,
    
    -- Deposit Configuration
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount NUMERIC(10, 2) DEFAULT 0,
    deposit_type TEXT DEFAULT 'fixed', -- fixed, percentage
    
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    category TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Many-to-Many: Doctors <-> Services
CREATE TABLE public.doctor_services (
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, service_id)
);

-- ==========================================
-- 6. PATIENTS
-- ==========================================

CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    dob DATE,
    gender TEXT,
    address TEXT,
    
    -- Medical Info
    blood_group TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    notes TEXT,
    
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Preferences
    language TEXT DEFAULT 'en',
    whatsapp_opt_in BOOLEAN DEFAULT true,
    email_opt_in BOOLEAN DEFAULT true,
    
    -- Stats (Denormalized for performance, updated via triggers)
    total_visits INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    
    -- Flags
    is_vip BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    requires_deposit BOOLEAN DEFAULT false,
    
    source TEXT DEFAULT 'manual', -- manual, booking_page, import
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patient Tags
CREATE TABLE public.patient_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',
    UNIQUE(clinic_id, name)
);

CREATE TABLE public.patient_tag_links (
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.patient_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, tag_id)
);

-- ==========================================
-- 7. APPOINTMENTS
-- ==========================================

CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
CREATE TYPE patient_response AS ENUM ('no_response', 'confirmed', 'will_reschedule', 'cancelled');
CREATE TYPE booking_source AS ENUM ('dashboard', 'booking_page', 'whatsapp', 'phone', 'walk_in');

CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    
    status appointment_status DEFAULT 'pending',
    
    -- Deposit Tracking
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount NUMERIC(10, 2) DEFAULT 0,
    deposit_status TEXT DEFAULT 'pending', -- pending, paid, refunded, waived
    deposit_payment_id UUID, -- Link to payments table
    
    -- Reminder Tracking
    confirmation_sent BOOLEAN DEFAULT false,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_48h_sent BOOLEAN DEFAULT false,
    reminder_48h_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_24h_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_2h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent_at TIMESTAMP WITH TIME ZONE,
    noshow_followup_sent BOOLEAN DEFAULT false,
    noshow_followup_sent_at TIMESTAMP WITH TIME ZONE,
    
    patient_response patient_response DEFAULT 'no_response',
    
    internal_notes TEXT,
    patient_notes TEXT,
    
    source booking_source DEFAULT 'dashboard',
    booked_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    
    -- Rescheduling Chain
    original_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. RECURRING APPOINTMENTS
-- ==========================================

CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');

CREATE TABLE public.recurring_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    
    frequency recurrence_frequency NOT NULL,
    interval INTEGER DEFAULT 1, -- every X days/weeks
    days_of_week INTEGER[], -- [1, 3, 5] for Mon, Wed, Fri
    
    start_date DATE NOT NULL,
    end_date DATE,
    occurrences INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. WHATSAPP & REMINDERS
-- ==========================================

CREATE TYPE connection_status AS ENUM ('disconnected', 'connecting', 'connected', 'expired');

CREATE TABLE public.whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    session_data JSONB,
    status connection_status DEFAULT 'disconnected',
    qr_code TEXT,
    
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(clinic_id)
);

CREATE TABLE public.reminder_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    -- Toggles
    enable_confirmation BOOLEAN DEFAULT true,
    enable_48h BOOLEAN DEFAULT false,
    enable_24h BOOLEAN DEFAULT true,
    enable_2h BOOLEAN DEFAULT false,
    enable_noshow_followup BOOLEAN DEFAULT true,
    
    -- Template Overrides (Optional, links to message_templates if null)
    -- We can store clinic-specific customizations here or use a separate table
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(clinic_id)
);

CREATE TYPE template_category AS ENUM ('confirmation', 'reminder', 'followup', 'campaign', 'custom');

CREATE TABLE public.message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE, -- Null for system templates
    
    name TEXT NOT NULL,
    category template_category NOT NULL,
    language TEXT DEFAULT 'en',
    content TEXT NOT NULL,
    variables TEXT[], -- ['patient_name', 'time', 'link']
    
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE message_channel AS ENUM ('whatsapp', 'sms', 'email');

CREATE TABLE public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    channel message_channel DEFAULT 'whatsapp',
    type TEXT, -- reminder_24h, manual, campaign, etc.
    
    content TEXT,
    status message_status DEFAULT 'pending',
    error_details TEXT,
    
    provider_message_id TEXT, -- WhatsApp message ID
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 10. CAMPAIGNS
-- ==========================================

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'cancelled');

CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    audience_filter JSONB NOT NULL, -- e.g. { "last_visit_before": "2023-01-01" }
    template_id UUID REFERENCES public.message_templates(id),
    
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status campaign_status DEFAULT 'draft',
    
    stats JSONB DEFAULT '{"total": 0, "sent": 0, "delivered": 0, "read": 0, "failed": 0}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    
    status message_status DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 11. PAYMENTS
-- ==========================================

CREATE TABLE public.payment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT, -- Should be encrypted in app logic
    webhook_secret TEXT,
    is_test_mode BOOLEAN DEFAULT true,
    
    UNIQUE(clinic_id)
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    type TEXT, -- deposit, consultation, package
    
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    status TEXT DEFAULT 'pending', -- pending, captured, failed, refunded
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 12. WAITING LIST & FOLLOWUPS
-- ==========================================

CREATE TABLE public.waiting_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    
    preferences JSONB, -- { "days": ["Mon"], "time_range": "Morning" }
    priority TEXT DEFAULT 'normal',
    
    notes TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'active', -- active, converted, expired, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    original_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    
    type TEXT, -- post_treatment, checkup
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, booked, cancelled
    
    message_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 13. MISC
-- ==========================================

CREATE TABLE public.blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE, -- Null means whole clinic
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    type TEXT DEFAULT 'break', -- holiday, vacation, break
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL, -- create, update, delete
    entity_type TEXT NOT NULL, -- appointment, patient
    entity_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
