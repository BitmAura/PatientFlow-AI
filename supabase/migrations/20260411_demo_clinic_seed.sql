-- 🧬 Persona: Sales Engineering
-- ⚡ Purpose: Pre-populates a "Live Demo" clinic with high-density data for investor/clinic pitches.
-- 🛠 Fix: Using valid UUID strings and matching the patient_lifecycle_stage enums.

-- 1. The Clinic
INSERT INTO public.clinics (id, name, status, use_shared_number)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Aura Dental Care & Spa', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. The Doctors
INSERT INTO public.doctors (id, clinic_id, name, color)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Dr. Aryan Sharma (Oral Surgeon)', '#ef4444'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Dr. Priya Verma (Pedodontist)', '#3b82f6'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Dr. Meera N (Endodontist)', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- 3. Services
INSERT INTO public.services (id, clinic_id, name, duration, price, color)
VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Consultation', 15, 500, '#64748b'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Root Canal Treatment', 60, 4500, '#8b5cf6'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Pediatric Cleaning', 30, 1200, '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 4. Patients (50 Fake Patients - Core 5 for display)
INSERT INTO public.patients (id, clinic_id, full_name, phone, lifecycle_stage, whatsapp_opt_in)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', 'Rohan Mehra', '+919999999001', 'visited', true),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', 'Sneha Gupta', '+919999999002', 'new_patient', true),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', 'Amit Bansal', '+919999999003', 'recall_due', true),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440000', 'Kavita Iyer', '+919999999004', 'treatment_completed', true),
  ('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440000', 'Vikram Singh', '+919999999005', 'visited', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Appointments (Past & Future)
INSERT INTO public.appointments (id, clinic_id, patient_id, doctor_id, service_id, start_time, end_time, status)
VALUES
  -- Past Confirmed
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour 45 minutes', 'confirmed'),
  -- Today Upcoming
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 30 minutes', 'pending'),
  -- Tomorrow
  ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', NOW() + INTERVAL '24 hours', NOW() + INTERVAL '25 hours', 'pending'),
  -- No-Show Case (For Demo)
  ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 hours', 'no_show')
ON CONFLICT (id) DO NOTHING;

-- 6. Reminder Logs (Communication History)
INSERT INTO public.reminder_logs (clinic_id, patient_id, appointment_id, type, status, message)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'reminder_24h', 'sent', 'Hi Rohan, your appointment at Aura Dental is tomorrow!'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440202', 'reminder_2h', 'sent', 'Hi Sneha, see you in 2 hours for your Pediatric Cleaning.');

-- 7. Recall Logic
INSERT INTO public.patient_recalls (clinic_id, patient_id, treatment_category, recall_due_date, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440103', 'Root Canal', (NOW() - INTERVAL '1 day')::DATE, 'pending');
