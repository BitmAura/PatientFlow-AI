-- Founder/CEO ROI Tracking (2024-04-04)
-- Purpose: Quantify the business impact of PatientFlow AI for clinic owners.

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_revenue NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS treatment_type TEXT;

-- Index for financial reporting performance
CREATE INDEX IF NOT EXISTS idx_leads_revenue ON leads(clinic_id, status) INCLUDE (estimated_value, actual_revenue);

-- Update existing leads with a baseline estimated value (average dental visit ₹2,500)
UPDATE leads SET estimated_value = 2500 WHERE estimated_value = 0;

COMMENT ON COLUMN leads.estimated_value IS 'The potential revenue value of this lead (Lead Pipeline Value)';
COMMENT ON COLUMN leads.actual_revenue IS 'The real revenue collected after conversion (SOI - Source of Impact)';
