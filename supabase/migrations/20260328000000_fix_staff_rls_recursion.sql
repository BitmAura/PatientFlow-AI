-- Fix Postgres 42P17: infinite recursion in RLS on public.staff.
-- Policies that subquery public.staff from within staff policies re-enter staff RLS.
-- SECURITY DEFINER helpers read staff without RLS so policies stay non-recursive.

CREATE OR REPLACE FUNCTION public.current_staff_clinic_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT clinic_id FROM public.staff WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_owned_clinic_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT clinic_id FROM public.staff
  WHERE user_id = auth.uid() AND role = 'owner'::public.staff_role;
$$;

REVOKE ALL ON FUNCTION public.current_staff_clinic_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_staff_clinic_ids() TO authenticated;
REVOKE ALL ON FUNCTION public.current_owned_clinic_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_owned_clinic_ids() TO authenticated;

DROP POLICY IF EXISTS "Staff can view their clinic" ON public.clinics;
CREATE POLICY "Staff can view their clinic" ON public.clinics
  FOR SELECT USING (id IN (SELECT public.current_staff_clinic_ids()));

DROP POLICY IF EXISTS "Owners can update their clinic" ON public.clinics;
CREATE POLICY "Owners can update their clinic" ON public.clinics
  FOR UPDATE USING (id IN (SELECT public.current_owned_clinic_ids()));

DROP POLICY IF EXISTS "Staff can view colleagues" ON public.staff;
CREATE POLICY "Staff can view colleagues" ON public.staff
  FOR SELECT USING (clinic_id IN (SELECT public.current_staff_clinic_ids()));

DROP POLICY IF EXISTS "Owners can manage staff" ON public.staff;
CREATE POLICY "Owners can manage staff" ON public.staff
  FOR ALL
  USING (clinic_id IN (SELECT public.current_owned_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT public.current_owned_clinic_ids()));
