# Schema Drift Notes (Phase 1)

This file tracks known app-to-schema mismatches found during Phase 1 hardening.

## High-Risk Items Addressed

- Added missing RLS policies for journey and reminder tables via:
  - `supabase/migrations/202603270002_rls_hardening_journeys_reminders.sql`
- Updated subscription webhook API to use service-role admin client:
  - `src/app/api/subscriptions/webhook/route.ts`

## Known Follow-ups

- Some code paths reference tables that are not clearly defined in the current migrations snapshot:
  - `notifications`
  - `activity_logs`
  - `usage_events`
  - `patient_otps`
- Action: validate live production schema against `supabase/migrations` and create canonical migration files for any missing tables.

## Validation Checklist

- Confirm all tenant-scoped tables have `ENABLE ROW LEVEL SECURITY`.
- Confirm read/write policies are clinic-scoped using `staff.clinic_id` + `auth.uid()`.
- Confirm all webhook/cron routes use `createAdminClient` for privileged writes.
