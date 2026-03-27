-- Phase 1C: Tenant safety hardening for journey + reminder tables
-- Adds missing RLS coverage for clinic-scoped tables introduced in earlier migrations.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journey_templates'
  ) THEN
    ALTER TABLE public.journey_templates ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view journey templates" ON public.journey_templates;
    CREATE POLICY "Staff can view journey templates"
      ON public.journey_templates FOR SELECT
      USING (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Owners can manage journey templates" ON public.journey_templates;
    CREATE POLICY "Owners can manage journey templates"
      ON public.journey_templates FOR ALL
      USING (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid() AND role = 'owner'
        )
      )
      WITH CHECK (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid() AND role = 'owner'
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journey_stages'
  ) THEN
    ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view journey stages" ON public.journey_stages;
    CREATE POLICY "Staff can view journey stages"
      ON public.journey_stages FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.journey_templates jt
          JOIN public.staff s ON s.clinic_id = jt.clinic_id
          WHERE jt.id = journey_stages.template_id
            AND s.user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Owners can manage journey stages" ON public.journey_stages;
    CREATE POLICY "Owners can manage journey stages"
      ON public.journey_stages FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.journey_templates jt
          JOIN public.staff s ON s.clinic_id = jt.clinic_id
          WHERE jt.id = journey_stages.template_id
            AND s.user_id = auth.uid()
            AND s.role = 'owner'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.journey_templates jt
          JOIN public.staff s ON s.clinic_id = jt.clinic_id
          WHERE jt.id = journey_stages.template_id
            AND s.user_id = auth.uid()
            AND s.role = 'owner'
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'patient_journeys'
  ) THEN
    ALTER TABLE public.patient_journeys ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view patient journeys" ON public.patient_journeys;
    CREATE POLICY "Staff can view patient journeys"
      ON public.patient_journeys FOR SELECT
      USING (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Staff can manage patient journeys" ON public.patient_journeys;
    CREATE POLICY "Staff can manage patient journeys"
      ON public.patient_journeys FOR ALL
      USING (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'patient_journey_stages'
  ) THEN
    ALTER TABLE public.patient_journey_stages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view patient journey stages" ON public.patient_journey_stages;
    CREATE POLICY "Staff can view patient journey stages"
      ON public.patient_journey_stages FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.patient_journeys pj
          JOIN public.staff s ON s.clinic_id = pj.clinic_id
          WHERE pj.id = patient_journey_stages.journey_id
            AND s.user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Staff can manage patient journey stages" ON public.patient_journey_stages;
    CREATE POLICY "Staff can manage patient journey stages"
      ON public.patient_journey_stages FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.patient_journeys pj
          JOIN public.staff s ON s.clinic_id = pj.clinic_id
          WHERE pj.id = patient_journey_stages.journey_id
            AND s.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.patient_journeys pj
          JOIN public.staff s ON s.clinic_id = pj.clinic_id
          WHERE pj.id = patient_journey_stages.journey_id
            AND s.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journey_transitions'
  ) THEN
    ALTER TABLE public.journey_transitions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view journey transitions" ON public.journey_transitions;
    CREATE POLICY "Staff can view journey transitions"
      ON public.journey_transitions FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.patient_journeys pj
          JOIN public.staff s ON s.clinic_id = pj.clinic_id
          WHERE pj.id = journey_transitions.journey_id
            AND s.user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Staff can insert journey transitions" ON public.journey_transitions;
    CREATE POLICY "Staff can insert journey transitions"
      ON public.journey_transitions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.patient_journeys pj
          JOIN public.staff s ON s.clinic_id = pj.clinic_id
          WHERE pj.id = journey_transitions.journey_id
            AND s.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reminder_logs'
  ) THEN
    ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view reminder logs" ON public.reminder_logs;
    CREATE POLICY "Staff can view reminder logs"
      ON public.reminder_logs FOR SELECT
      USING (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Staff can insert reminder logs" ON public.reminder_logs;
    CREATE POLICY "Staff can insert reminder logs"
      ON public.reminder_logs FOR INSERT
      WITH CHECK (
        clinic_id IN (
          SELECT clinic_id
          FROM public.staff
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;
