-- High-Ticket Lead Scoring (2024-04-04)
-- Purpose: Prioritize high-revenue dental treatments (Orthodontics, Implants).

CREATE TYPE treatment_tier_type AS ENUM ('tier_1', 'tier_2', 'tier_3');

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS treatment_type TEXT,
ADD COLUMN IF NOT EXISTS treatment_tier treatment_tier_type DEFAULT 'tier_3',
ADD COLUMN IF NOT EXISTS estimated_value INTEGER DEFAULT 0;

-- Index for sorting by value
CREATE INDEX IF NOT EXISTS idx_leads_financial_priority ON leads(treatment_tier, estimated_value DESC);

-- Comment for transparency
COMMENT ON COLUMN leads.treatment_tier IS 'Tier 1: Implants/Ortho, Tier 2: RCT/Crowns, Tier 3: General Cleanings';
COMMENT ON COLUMN leads.estimated_value IS 'Projected revenue in INR for the specific lead.';
