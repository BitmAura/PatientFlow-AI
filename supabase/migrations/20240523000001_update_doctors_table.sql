-- Add display fields to doctors table to support managed profiles
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the view or query logic will handle the fallback to users table if needed.
-- For now, we write to these fields when creating a doctor.
