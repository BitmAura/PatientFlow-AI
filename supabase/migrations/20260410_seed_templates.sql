-- Seed Default Meta-Approved Templates for All Clinics
-- This function can be called after a clinic signs up to ensure they have the defaults.

CREATE OR REPLACE FUNCTION seed_default_whatsapp_templates(p_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.whatsapp_templates (clinic_id, name, category, body_text, variables, meta_status)
    VALUES 
    (
        p_clinic_id, 
        'recall_v1', 
        'MARKETING', 
        'Hi {{1}}, it''s been a while since your last visit at {{2}}. We''d love to see you again! Book your appointment: {{3}}', 
        '["patient_name", "clinic_name", "booking_link"]', 
        'APPROVED' -- Assuming these are globally pre-approved in Gupshup/Meta shared app
    ),
    (
        p_clinic_id, 
        'no_show_recovery_v1', 
        'UTILITY', 
        'Hi {{1}}, we missed you today at {{2}}. Would you like to reschedule? Reply YES or book here: {{3}}', 
        '["patient_name", "clinic_name", "booking_link"]', 
        'APPROVED'
    ),
    (
        p_clinic_id, 
        'appointment_reminder_v1', 
        'UTILITY', 
        'Hi {{1}}, reminder: your appointment at {{2}} is tomorrow at {{3}}. Reply CONFIRM to confirm.', 
        '["patient_name", "clinic_name", "time"]', 
        'APPROVED'
    ),
    (
        p_clinic_id, 
        'lead_followup_v1', 
        'MARKETING', 
        'Hi {{1}}, thanks for your interest in {{2}}. Ready to book? Our next available slot: {{3}}. Reply YES.', 
        '["lead_name", "clinic_name", "next_slot"]', 
        'APPROVED'
    )
    ON CONFLICT (clinic_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Apply to all current clinics
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.clinics LOOP
        PERFORM seed_default_whatsapp_templates(r.id);
    END LOOP;
END $$;
