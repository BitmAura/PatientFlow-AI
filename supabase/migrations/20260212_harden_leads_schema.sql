-- 1. Update Lead Status Enum
-- We cannot remove values easily, but we can add new ones.
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'responsive';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'booked';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'invalid';

-- 2. Add followup_count to leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS followup_count INTEGER DEFAULT 0;

-- 3. Add metadata to lead_activities
ALTER TABLE lead_activities 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_followup_processing 
ON leads(clinic_id, status, next_followup_at) 
WHERE status = 'contacted';

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id_type 
ON lead_activities(lead_id, type);
