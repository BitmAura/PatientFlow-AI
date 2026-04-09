-- 🧬 Persona: Sales Engineering
-- ⚡ Purpose: Pre-populates a "Live Demo" clinic with high-density data for investor/clinic pitches.

-- 1. The Clinic
INSERT INTO public.clinics (id, name, status, use_shared_number)
VALUES ('demo-clinic-id', 'Aura Dental Care & Spa', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 2. The Doctors
INSERT INTO public.doctors (id, clinic_id, name, color)
VALUES 
  ('demo-dr-1', 'demo-clinic-id', 'Dr. Aryan Sharma (Oral Surgeon)', '#ef4444'),
  ('demo-dr-2', 'demo-clinic-id', 'Dr. Priya Verma (Pedodontist)', '#3b82f6'),
  ('demo-dr-3', 'demo-clinic-id', 'Dr. Meera N (Endodontist)', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- 3. Services
INSERT INTO public.services (id, clinic_id, name, duration, price, color)
VALUES
  ('demo-svc-1', 'demo-clinic-id', 'Consultation', 15, 500, '#64748b'),
  ('demo-svc-2', 'demo-clinic-id', 'Root Canal Treatment', 60, 4500, '#8b5cf6'),
  ('demo-svc-3', 'demo-clinic-id', 'Pediatric Cleaning', 30, 1200, '#ec4899')
ON CONFLICT (id) DO NOTHING;

-- 4. Patients (50 Fake Patients)
-- Using a loop for efficiency if possible, or just a large insert
-- Here we'll insert a curated list for variety
INSERT INTO public.patients (id, clinic_id, full_name, phone, lifecycle_stage, whatsapp_consent)
VALUES
  ('p-1', 'demo-clinic-id', 'Rohan Mehra', '+919999999001', 'active', true),
  ('p-2', 'demo-clinic-id', 'Sneha Gupta', '+919999999002', 'new', true),
  ('p-3', 'demo-clinic-id', 'Amit Bansal', '+919999999003', 'lost', true),
  ('p-4', 'demo-clinic-id', 'Kavita Iyer', '+919999999004', 'repeat', true),
  ('p-5', 'demo-clinic-id', 'Vikram Singh', '+919999999005', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Appointments (Past & Future)
INSERT INTO public.appointments (id, clinic_id, patient_id, doctor_id, service_id, start_time, end_time, status)
VALUES
  -- Past Confirmed
  ('appt-1', 'demo-clinic-id', 'p-1', 'demo-dr-1', 'demo-svc-1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour 45 minutes', 'confirmed'),
  -- Today Upcoming
  ('appt-2', 'demo-clinic-id', 'p-2', 'demo-dr-2', 'demo-svc-3', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 30 minutes', 'pending'),
  -- Tomorrow
  ('appt-3', 'demo-clinic-id', 'p-4', 'demo-dr-3', 'demo-svc-2', NOW() + INTERVAL '24 hours', NOW() + INTERVAL '25 hours', 'pending'),
  -- No-Show Case (For Demo)
  ('appt-4', 'demo-clinic-id', 'p-3', 'demo-dr-1', 'demo-svc-2', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 hours', 'no_show')
ON CONFLICT (id) DO NOTHING;

-- 6. Reminder Logs (Communication History)
INSERT INTO public.reminder_logs (clinic_id, patient_id, appointment_id, type, status, message)
VALUES
  ('demo-clinic-id', 'p-1', 'appt-1', 'reminder_24h', 'sent', 'Hi Rohan, your appointment at Aura Dental is tomorrow!'),
  ('demo-clinic-id', 'p-2', 'appt-2', 'reminder_2h', 'sent', 'Hi Sneha, see you in 2 hours for your Pediatric Cleaning.');

-- 7. Recall Logic
INSERT INTO public.patient_recalls (clinic_id, patient_id, treatment_category, recall_due_date, status)
VALUES
  ('demo-clinic-id', 'p-3', 'Root Canal', NOW() - INTERVAL '1 day', 'pending');
