-- Allow authenticated users to read their own staff row (for onboarding guard check).
-- Without this, "Staff can view colleagues" only returns rows if you already have a staff row (chicken-egg).
DROP POLICY IF EXISTS "Users can read own staff row" ON public.staff;
CREATE POLICY "Users can read own staff row" ON public.staff
  FOR SELECT USING (user_id = auth.uid());
