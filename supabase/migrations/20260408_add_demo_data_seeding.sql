-- Function to seed demo data for new trial users
CREATE OR REPLACE FUNCTION seed_trial_demo_data(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_clinic_id UUID;
  v_patient_id UUID;
BEGIN
  -- Find the clinic for this user
  SELECT clinic_id INTO v_clinic_id
  FROM public.staff
  WHERE user_id = p_user_id AND role = 'owner'
  LIMIT 1;

  IF v_clinic_id IS NULL THEN
    RETURN;
  END IF;

  -- Insert sample patients
  INSERT INTO public.patients (clinic_id, full_name, phone, email, status)
  VALUES
    (v_clinic_id, 'John Doe (Sample)', '919988776655', 'john@example.com', 'active'),
    (v_clinic_id, 'Sarah Smith (Sample)', '919977665544', 'sarah@example.com', 'active'),
    (v_clinic_id, 'Dr. Mike (Sample)', '919966554433', 'mike@example.com', 'active');

  -- Get patient IDs and create leads/recalls
  FOR v_patient_id IN
    SELECT id FROM public.patients WHERE clinic_id = v_clinic_id AND full_name LIKE '%(Sample)%'
  LOOP
    -- Create leads
    INSERT INTO public.leads (clinic_id, patient_id, full_name, phone, email, status, estimated_value, actual_revenue, source, treatment_type, treatment_tier)
    VALUES (
      v_clinic_id,
      v_patient_id,
      (SELECT full_name FROM public.patients WHERE id = v_patient_id),
      (SELECT phone FROM public.patients WHERE id = v_patient_id),
      (SELECT email FROM public.patients WHERE id = v_patient_id),
      CASE WHEN (SELECT full_name FROM public.patients WHERE id = v_patient_id) LIKE '%Mike%' THEN 'converted' ELSE 'lost' END,
      CASE WHEN (SELECT full_name FROM public.patients WHERE id = v_patient_id) LIKE '%Mike%' THEN 25000 ELSE 5000 END,
      CASE WHEN (SELECT full_name FROM public.patients WHERE id = v_patient_id) LIKE '%Mike%' THEN 25000 ELSE 0 END,
      'whatsapp_recall',
      CASE WHEN (SELECT full_name FROM public.patients WHERE id = v_patient_id) LIKE '%John%' THEN 'Dental Implant' ELSE 'Cleaning' END,
      CASE WHEN (SELECT full_name FROM public.patients WHERE id = v_patient_id) LIKE '%John%' THEN 'tier_1' ELSE 'tier_3' END
    );

    -- Create overdue recalls
    INSERT INTO public.patient_recalls (clinic_id, patient_id, status, last_visit_date, attempt_count)
    VALUES (
      v_clinic_id,
      v_patient_id,
      'overdue',
      NOW() - INTERVAL '35 days',
      0
    );
  END LOOP;

  -- Insert sample treatments
  INSERT INTO public.treatments (clinic_id, name, category, tier, price_paise)
  VALUES
    (v_clinic_id, 'Teeth Cleaning', 'cleaning', 'tier_3', 150000),
    (v_clinic_id, 'Root Canal (RCT)', 'root_canal', 'tier_2', 850000),
    (v_clinic_id, 'Full Ceramic Implant', 'implant', 'tier_1', 3500000),
    (v_clinic_id, 'Invisalign / Ortho', 'ortho', 'tier_1', 12000000);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;