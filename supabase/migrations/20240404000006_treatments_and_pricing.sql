-- 🛡️ Phase 23: Absolute Verification - Treatments & Pricing Engine
-- Purpose: Enable "Price AI" and "Tier-Based Recovery" for all clinic operations.

CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'implant', 'ortho', 'root_canal', 'cleaning', etc.
    tier TEXT NOT NULL CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')),
    price_paise BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Clinic staff can manage their treatments"
    ON treatments FOR ALL
    USING (clinic_id IN (SELECT clinic_id FROM staff WHERE user_id = auth.uid()));

-- Index for fast lookup by bot
CREATE INDEX IF NOT EXISTS idx_treatments_clinic_category ON treatments(clinic_id, category);
CREATE INDEX IF NOT EXISTS idx_treatments_clinic_tier ON treatments(clinic_id, tier);

-- 🤖 Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
