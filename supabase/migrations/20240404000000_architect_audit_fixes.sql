-- Backend Architect Audit Fixes (2024-04-04)
-- 1. Enable PostGIS for spatial queries (nearest clinic)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create modern handle_updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Enhance clinic_locations for GE0
-- Adding geographic point for proximity searches (Aura Precision Location)
ALTER TABLE clinic_locations 
ADD COLUMN IF NOT EXISTS location_point geography(POINT, 4326);

CREATE INDEX IF NOT EXISTS idx_clinic_locations_geo 
ON clinic_locations USING GIST (location_point);

-- 4. Apply updated_at triggers
DROP TRIGGER IF EXISTS tr_clinic_locations_updated_at ON clinic_locations;
CREATE TRIGGER tr_clinic_locations_updated_at
  BEFORE UPDATE ON clinic_locations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_leads_updated_at ON leads;
CREATE TRIGGER tr_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Comment for transparency
COMMENT ON COLUMN clinic_locations.location_point IS 'Spatial coordinate for nearest-branch AI discovery (GEO/AEO)';
