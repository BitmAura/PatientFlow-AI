-- DISHA Compliance: consent tracking, data export, deletion support
-- Digital Information Security in Healthcare Act (India)

-- 1. Add consent columns to patients table
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS consent_given       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp   timestamptz,
  ADD COLUMN IF NOT EXISTS consent_ip          text,
  ADD COLUMN IF NOT EXISTS data_deletion_requested_at timestamptz;

-- 2. Add consent to appointments (captures consent at booking time)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS booking_consent_given     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_consent_timestamp timestamptz;

-- 3. Consent log table — immutable audit trail
CREATE TABLE IF NOT EXISTS patient_consent_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    uuid REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id     uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  action        text NOT NULL CHECK (action IN ('consent_given','consent_withdrawn','data_export_requested','data_deletion_requested')),
  ip_address    text,
  user_agent    text,
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 4. RLS: clinic staff can read consent logs, patients cannot write
ALTER TABLE patient_consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_staff_read_consent_logs" ON patient_consent_logs
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service_role_all_consent_logs" ON patient_consent_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_consent_logs_patient   ON patient_consent_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_clinic    ON patient_consent_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_deletion_req  ON patients(data_deletion_requested_at) WHERE data_deletion_requested_at IS NOT NULL;

COMMENT ON TABLE patient_consent_logs IS 'Immutable audit trail of patient consent events for DISHA compliance';
COMMENT ON COLUMN patients.consent_given IS 'Whether the patient has given explicit consent for data processing under DISHA';
COMMENT ON COLUMN patients.data_deletion_requested_at IS 'Timestamp when patient requested data deletion (right to erasure)';
