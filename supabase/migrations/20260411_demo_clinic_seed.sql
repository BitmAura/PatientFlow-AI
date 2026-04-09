-- 🧬 Persona: Sales Engineering
-- ⚡ Purpose: Pre-populates a "Live Demo" clinic with high-density data.
-- 🛠 Refactor: Added 'staff' identity records for doctors to satisfy PK/FK constraints.

-- 1. The Clinic
INSERT INTO public.clinics (id, name, status, use_shared_number)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Aura Dental Care & Spa', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. The Staff (Identity Layer)
-- Note: user_id is NULL to indicate these are system-generated demo doctors/staff.
INSERT INTO public.staff (id, clinic_id, user_id, role, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NULL, 'doctor', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', NULL, 'doctor', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, 'doctor', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. The Doctors (Medical Layer - linked to Staff ID)
INSERT INTO public.doctors (id, clinic_id, specialization, consultation_fee)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Oral Surgeon', 1000),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Pedodontist', 800),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Endodontist', 1200)
ON CONFLICT (id) DO NOTHING;

-- 4. Services (Corrected 'duration' column from schema.sql)
INSERT INTO public.services (id, clinic_id, name, duration, price, color)
VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Consultation', 15, 500, '#64748b'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Root Canal Treatment', 60, 4500, '#8b5cf6'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Pediatric Cleaning', 30, 1200, '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 5. Patients
INSERT INTO public.patients (id, clinic_id, full_name, phone, lifecycle_stage, whatsapp_opt_in)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', 'Rohan Mehra', '+919999999001', 'visited', true),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', 'Sneha Gupta', '+919999999002', 'new_patient', true),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', 'Amit Bansal', '+919999999003', 'recall_due', true),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440000', 'Kavita Iyer', '+919999999004', 'treatment_completed', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Appointments
INSERT INTO public.appointments (id, clinic_id, patient_id, doctor_id, service_id, start_time, end_time, duration, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour 45 minutes', 15, 'confirmed'),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 30 minutes', 30, 'pending')
ON CONFLICT (id) DO NOTHING;
