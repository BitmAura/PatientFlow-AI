-- ==========================================
-- 1. AUTO-UPDATE TIMESTAMPS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clinics_modtime BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_staff_modtime BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_doctors_modtime BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 2. HANDLE NEW USER SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. UPDATE PATIENT STATS
-- ==========================================

CREATE OR REPLACE FUNCTION calculate_patient_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_patient_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_patient_id := OLD.patient_id;
    ELSE
        target_patient_id := NEW.patient_id;
    END IF;

    UPDATE public.patients
    SET 
        total_visits = (SELECT count(*) FROM public.appointments WHERE patient_id = target_patient_id AND status = 'completed'),
        no_shows = (SELECT count(*) FROM public.appointments WHERE patient_id = target_patient_id AND status = 'no_show'),
        cancellations = (SELECT count(*) FROM public.appointments WHERE patient_id = target_patient_id AND status = 'cancelled')
    WHERE id = target_patient_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE PROCEDURE calculate_patient_stats();
