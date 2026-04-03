-- Multi-location support
-- Each row represents a physical branch of a clinic

CREATE TABLE IF NOT EXISTS clinic_locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        text NOT NULL,                   -- e.g. "Koramangala Branch"
  address     text,
  city        text,
  phone       text,
  is_primary  boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Only one primary location per clinic
CREATE UNIQUE INDEX idx_clinic_locations_primary
  ON clinic_locations(clinic_id)
  WHERE is_primary = true;

-- RLS
ALTER TABLE clinic_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_staff_read_locations" ON clinic_locations
  FOR SELECT TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE user_id = auth.uid())
  );

CREATE POLICY "clinic_staff_manage_locations" ON clinic_locations
  FOR ALL TO authenticated
  USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE user_id = auth.uid())
  )
  WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM staff WHERE user_id = auth.uid())
  );

CREATE POLICY "service_role_all_locations" ON clinic_locations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clinic_locations_clinic ON clinic_locations(clinic_id);

-- Seed primary location from existing clinics data
-- (This runs once; after migration, each clinic gets a default primary location)
INSERT INTO clinic_locations (clinic_id, name, is_primary)
SELECT id, name, true
FROM clinics
ON CONFLICT DO NOTHING;

COMMENT ON TABLE clinic_locations IS 'Physical branches for multi-location clinic support';
