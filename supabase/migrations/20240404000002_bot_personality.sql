-- WhatsApp Bot Personality Tuning (2024-04-04)
-- Purpose: Allow clinics to customize the AI "Voice" and Tone.

CREATE TYPE bot_personality_type AS ENUM ('professional', 'friendly', 'direct', 'custom');

ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS bot_personality bot_personality_type DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS bot_name TEXT DEFAULT 'Aura AI';

COMMENT ON COLUMN clinics.bot_personality IS 'The AI tone used for automated patient communications.';
COMMENT ON COLUMN clinics.bot_name IS 'The display name used by the AI in its self-introduction.';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_clinics_personality ON clinics(id, bot_personality);
