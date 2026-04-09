-- Migration: Enable RLS on all clinic-scoped tables for multi-tenant security
-- Date: 2026-04-09
-- Purpose: Add Row-Level Security policies to tables missing them to prevent cross-clinic data leakage

-- ==========================================
-- TABLES MISSING RLS (19 tables)
-- ==========================================

-- 1. DOCTOR_SERVICES - Link between doctors and services
ALTER TABLE public.doctor_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view doctor services" ON public.doctor_services FOR SELECT
USING (
  doctor_id IN (
    SELECT d.id FROM public.doctors d
    INNER JOIN public.staff s ON s.clinic_id = d.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Clinic staff can manage doctor services" ON public.doctor_services FOR ALL
USING (
  doctor_id IN (
    SELECT d.id FROM public.doctors d
    INNER JOIN public.staff s ON s.clinic_id = d.clinic_id
    WHERE s.user_id = auth.uid() AND s.role IN ('owner', 'receptionist')
  )
);

-- 2. PATIENT_TAGS - Custom patient categorization
ALTER TABLE public.patient_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff can view patient tags" ON public.patient_tags FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clinic staff can manage patient tags" ON public.patient_tags FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

-- 3. PATIENT_TAG_LINKS - Junction table for patient tags
ALTER TABLE public.patient_tag_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view patient tag links" ON public.patient_tag_links FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.staff s ON s.clinic_id = p.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage patient tag links" ON public.patient_tag_links FOR ALL
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.staff s ON s.clinic_id = p.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

-- 4. RECURRING_PATTERNS - Appointment recurrence rules
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view recurring patterns" ON public.recurring_patterns FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage recurring patterns" ON public.recurring_patterns FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')
  )
);

-- 5. COMMUNICATION_LOGS - Audit trail of all messages sent
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view communication logs" ON public.communication_logs FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can create communication logs" ON public.communication_logs FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

-- 6. CAMPAIGN_RECIPIENTS - Individual campaign delivery tracking
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view campaign recipients" ON public.campaign_recipients FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns c
    INNER JOIN public.staff s ON s.clinic_id = c.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage campaign recipients" ON public.campaign_recipients FOR ALL
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns c
    INNER JOIN public.staff s ON s.clinic_id = c.clinic_id
    WHERE s.user_id = auth.uid() AND s.role IN ('owner', 'receptionist')
  )
);

-- 7. PAYMENT_SETTINGS - Razorpay credentials per clinic
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can view payment settings" ON public.payment_settings FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Clinic owners can manage payment settings" ON public.payment_settings FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- 8. WAITING_LIST - Patients waiting for availability
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view waiting list" ON public.waiting_list FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage waiting list" ON public.waiting_list FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

-- 9. FOLLOWUPS - Post-treatment follow-ups
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view followups" ON public.followups FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage followups" ON public.followups FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

-- 10. BLOCKED_SLOTS - Holidays, breaks, vacations
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view blocked slots" ON public.blocked_slots FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage blocked slots" ON public.blocked_slots FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')
  )
);

-- 11. AUDIT_LOGS - Activity audit trail (most restrictive - audit only, rarely needed by users)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can view audit logs" ON public.audit_logs FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Audit logs are insert-only by system" ON public.audit_logs FOR INSERT
WITH CHECK (true); -- System can insert logs

-- 12. LEADS - Lead management for marketing
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view leads" ON public.leads FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage leads" ON public.leads FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

-- 13. LEAD_ACTIVITIES - Lead interaction history
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead activities" ON public.lead_activities FOR SELECT
USING (
  lead_id IN (
    SELECT id FROM public.leads l
    INNER JOIN public.staff s ON s.clinic_id = l.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can create lead activities" ON public.lead_activities FOR INSERT
WITH CHECK (
  lead_id IN (
    SELECT id FROM public.leads l
    INNER JOIN public.staff s ON s.clinic_id = l.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

-- 14. PATIENT_JOURNEYS - Custom patient journey workflows
ALTER TABLE public.patient_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view patient journeys" ON public.patient_journeys FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage patient journeys" ON public.patient_journeys FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role IN ('owner', 'receptionist')
  )
);

-- 15. PATIENT_JOURNEY_STAGES - Journey workflow stages
ALTER TABLE public.patient_journey_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view journey stages" ON public.patient_journey_stages FOR SELECT
USING (
  journey_id IN (
    SELECT id FROM public.patient_journeys j
    INNER JOIN public.staff s ON s.clinic_id = j.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage journey stages" ON public.patient_journey_stages FOR ALL
USING (
  journey_id IN (
    SELECT id FROM public.patient_journeys j
    INNER JOIN public.staff s ON s.clinic_id = j.clinic_id
    WHERE s.user_id = auth.uid() AND s.role IN ('owner', 'receptionist')
  )
);

-- 16. JOURNEY_TRANSITIONS - Transitions between journey stages
ALTER TABLE public.journey_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view journey transitions" ON public.journey_transitions FOR SELECT
USING (
  journey_id IN (
    SELECT id FROM public.patient_journeys j
    INNER JOIN public.staff s ON s.clinic_id = j.clinic_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can manage journey transitions" ON public.journey_transitions FOR ALL
USING (
  journey_id IN (
    SELECT id FROM public.patient_journeys j
    INNER JOIN public.staff s ON s.clinic_id = j.clinic_id
    WHERE s.user_id = auth.uid() AND s.role IN ('owner', 'receptionist')
  )
);

-- 17. JOURNEY_TEMPLATES - Pre-built journey templates
ALTER TABLE public.journey_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All clinic staff can view journey templates" ON public.journey_templates FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
  ) OR clinic_id IS NULL -- Global templates
);

CREATE POLICY "Clinic owners can manage journey templates" ON public.journey_templates FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- 18. JOURNEY_STAGES (template level) - Stages available in templates
ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All clinic staff can view journey template stages" ON public.journey_stages FOR SELECT
USING (
  template_id IN (
    SELECT id FROM public.journey_templates
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid()
    ) OR clinic_id IS NULL
  )
);

CREATE POLICY "Clinic owners can manage journey template stages" ON public.journey_stages FOR ALL
USING (
  template_id IN (
    SELECT id FROM public.journey_templates
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.staff WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
);

-- ==========================================
-- VERIFICATION & SUMMARY
-- ==========================================
-- This migration secures 18 previously unprotected tables
-- All policies follow the clinic-scoped multi-tenant pattern:
--   - SELECT: User must be staff in the clinic
--   - INSERT/UPDATE/DELETE: Additional role-based restrictions where applicable (owner/receptionist)
-- 
-- Tables secured:
--   ✅ doctor_services
--   ✅ patient_tags
--   ✅ patient_tag_links
--   ✅ recurring_patterns
--   ✅ communication_logs
--   ✅ campaign_recipients
--   ✅ payment_settings (owner only)
--   ✅ waiting_list
--   ✅ followups
--   ✅ blocked_slots
--   ✅ audit_logs (owner only)
--   ✅ leads
--   ✅ lead_activities
--   ✅ patient_journeys
--   ✅ patient_journey_stages
--   ✅ journey_transitions
--   ✅ journey_templates
--   ✅ journey_stages
