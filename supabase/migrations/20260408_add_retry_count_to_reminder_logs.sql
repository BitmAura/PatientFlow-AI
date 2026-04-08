-- Add retry_count column to reminder_logs for tracking message retry attempts
ALTER TABLE public.reminder_logs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;