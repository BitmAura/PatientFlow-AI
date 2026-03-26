-- RLS for clinics and staff (so dashboard only shows own clinic).
-- If these policies already exist from rls.sql, this is idempotent with IF NOT EXISTS / DROP IF EXISTS.

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view their clinic" ON public.clinics;
CREATE POLICY "Staff can view their clinic" ON public.clinics
  FOR SELECT USING (id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can update their clinic" ON public.clinics;
CREATE POLICY "Owners can update their clinic" ON public.clinics
  FOR UPDATE USING (id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

DROP POLICY IF EXISTS "Staff can view colleagues" ON public.staff;
CREATE POLICY "Staff can view colleagues" ON public.staff
  FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Owners can manage staff" ON public.staff;
CREATE POLICY "Owners can manage staff" ON public.staff
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'));

-- Allow insert for onboarding (no staff row yet): service role bypasses RLS; anon needs a way to create first staff.
-- Onboarding uses admin client, so no policy needed for insert from app. If you need staff self-insert, add WITH CHECK.
