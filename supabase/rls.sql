-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- 1. USERS
-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. CLINICS
-- Staff can view their clinic
CREATE POLICY "Staff can view their clinic" ON public.clinics FOR SELECT 
USING (id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- Owners can update their clinic
CREATE POLICY "Owners can update their clinic" ON public.clinics FOR UPDATE 
USING (id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

-- 3. STAFF
-- Staff can view colleagues in same clinic
CREATE POLICY "Staff can view colleagues" ON public.staff FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- Owners can manage staff
CREATE POLICY "Owners can manage staff" ON public.staff FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

-- 4. GENERIC CLINIC-SCOPED POLICY (Template for other tables)
-- Define a macro-like function isn't standard SQL, so we apply similar logic to all tables

-- DOCTORS
CREATE POLICY "Staff can view doctors" ON public.doctors FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage doctors" ON public.doctors FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')));

-- SERVICES
CREATE POLICY "Staff can view services" ON public.services FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage services" ON public.services FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')));

-- PATIENTS
CREATE POLICY "Staff can view patients" ON public.patients FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage patients" ON public.patients FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- APPOINTMENTS
CREATE POLICY "Staff can view appointments" ON public.appointments FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage appointments" ON public.appointments FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- REMINDER SETTINGS
CREATE POLICY "Staff can view settings" ON public.reminder_settings FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update settings" ON public.reminder_settings FOR UPDATE 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

-- CAMPAIGNS
CREATE POLICY "Staff can view campaigns" ON public.campaigns FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage campaigns" ON public.campaigns FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')));
