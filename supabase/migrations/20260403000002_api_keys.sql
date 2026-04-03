-- API Keys for Pro plan clinics
-- Allows programmatic access to PatientFlow AI data

CREATE TABLE IF NOT EXISTS clinic_api_keys (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name          text NOT NULL,                        -- human label e.g. "EMR Integration"
  key_hash      text NOT NULL UNIQUE,                 -- bcrypt/sha256 hash — never store plaintext
  key_prefix    text NOT NULL,                        -- first 8 chars for display e.g. "pfai_a1b2"
  last_used_at  timestamptz,
  expires_at    timestamptz,                          -- NULL = never expires
  scopes        text[] NOT NULL DEFAULT '{read}',     -- 'read' | 'write' | 'admin'
  is_active     boolean NOT NULL DEFAULT true,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz
);

-- RLS: only the clinic's staff can manage their keys
ALTER TABLE clinic_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_staff_manage_api_keys" ON clinic_api_keys
  FOR ALL TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service_role_all_api_keys" ON clinic_api_keys
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_api_keys_clinic    ON clinic_api_keys(clinic_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash      ON clinic_api_keys(key_hash) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix    ON clinic_api_keys(key_prefix);

COMMENT ON TABLE clinic_api_keys IS 'API keys for Pro plan clinics to access PatientFlow AI programmatically';
COMMENT ON COLUMN clinic_api_keys.key_hash IS 'SHA-256 hash of the full API key. Plaintext shown only at creation.';
COMMENT ON COLUMN clinic_api_keys.key_prefix IS 'First 8 chars of the key shown in the UI for identification.';
