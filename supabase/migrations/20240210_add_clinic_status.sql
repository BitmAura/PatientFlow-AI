-- Add status column to clinics table
CREATE TYPE clinic_status AS ENUM ('active', 'suspended', 'offboarded');

ALTER TABLE public.clinics 
ADD COLUMN status clinic_status DEFAULT 'active' NOT NULL;

-- Add index for performance
CREATE INDEX idx_clinics_status ON public.clinics(status);

-- Update RLS policies (optional, but good practice)
-- Ensure suspended/offboarded clinics cannot be accessed by public APIs if needed
