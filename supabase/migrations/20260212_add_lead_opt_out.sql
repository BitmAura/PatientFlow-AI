-- Add is_opted_out column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_opted_out BOOLEAN DEFAULT FALSE;

-- Index for fast lookup of opted-out leads
CREATE INDEX IF NOT EXISTS idx_leads_opted_out ON leads(is_opted_out);
