-- Align lead_activities with code: add actor_id and description if missing.
-- Code uses actor_id (user_id) and description; original schema had staff_id and content.
-- We add new columns so inserts from LeadService and webhooks work.

ALTER TABLE lead_activities
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE lead_activities
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Backfill description from content for existing rows (if content exists and description is null)
UPDATE lead_activities
  SET description = content
  WHERE description IS NULL AND content IS NOT NULL;

-- Optional: backfill actor_id from staff_id if you have a staff.user_id mapping
-- (Skip if staff table has user_id and you want to migrate later)
-- UPDATE lead_activities la SET actor_id = s.user_id FROM staff s WHERE la.staff_id = s.id AND la.actor_id IS NULL;
