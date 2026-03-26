-- Update waiting_list table to match new requirements

-- Add service_id if it doesn't exist (and drop doctor_id if replaced, or keep both)
ALTER TABLE public.waiting_list 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

-- Add notification_expires_at
ALTER TABLE public.waiting_list 
ADD COLUMN IF NOT EXISTS notification_expires_at TIMESTAMP WITH TIME ZONE;

-- Update status check constraint if it exists, or just ensure values are compatible
ALTER TABLE public.waiting_list 
DROP CONSTRAINT IF EXISTS waiting_list_status_check;

ALTER TABLE public.waiting_list 
ADD CONSTRAINT waiting_list_status_check 
CHECK (status IN ('waiting', 'notified', 'booked', 'expired', 'cancelled', 'active', 'converted')); 
-- Note: keeping 'active' and 'converted' for backward compatibility if needed, but code uses 'waiting' and 'booked'.

-- Ensure preferences is JSONB (already is)
-- Ensure priority is text (already is)

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON public.waiting_list(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_service_id ON public.waiting_list(service_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_clinic_id ON public.waiting_list(clinic_id);
