-- Enable Row Level Security on leads and lead_activities.
-- Staff can only access rows for their clinic (staff.user_id = auth.uid() -> clinic_id).
-- Service role (cron, webhooks) bypasses RLS — ensure cron routes use createAdminClient().

-- ==========================================
-- LEADS
-- ==========================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Access Leads" ON public.leads;
CREATE POLICY "Staff Access Leads" ON public.leads
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff Insert Leads" ON public.leads;
CREATE POLICY "Staff Insert Leads" ON public.leads
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff Update Leads" ON public.leads;
CREATE POLICY "Staff Update Leads" ON public.leads
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff Delete Leads" ON public.leads;
CREATE POLICY "Staff Delete Leads" ON public.leads
  USING (clinic_id IN (SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()));

-- ==========================================
-- LEAD_ACTIVITIES (via lead's clinic)
-- ==========================================
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff Access Lead Activities" ON public.lead_activities;
CREATE POLICY "Staff Access Lead Activities" ON public.lead_activities
  USING (lead_id IN (
    SELECT id FROM public.leads WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Staff Insert Lead Activities" ON public.lead_activities;
CREATE POLICY "Staff Insert Lead Activities" ON public.lead_activities
  WITH CHECK (lead_id IN (
    SELECT id FROM public.leads WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Staff Update Lead Activities" ON public.lead_activities;
CREATE POLICY "Staff Update Lead Activities" ON public.lead_activities
  USING (lead_id IN (
    SELECT id FROM public.leads WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Staff Delete Lead Activities" ON public.lead_activities;
CREATE POLICY "Staff Delete Lead Activities" ON public.lead_activities
  USING (lead_id IN (
    SELECT id FROM public.leads WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    )
  ));
