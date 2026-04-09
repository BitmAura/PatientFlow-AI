# 💾 Backup & Recovery Plan
**Version:** 1.0 (Audit Rectification)
**Goal:** Zero data loss for clinical records.

## Backup Strategy
- **Daily Backups:** Handled by Supabase (Managed Service).
- **Point-in-Time-Recovery (PITR):** Requires Supabase Pro. Allows recovery to any second within the last 7 days.
- **Manual Snapshots:** Before major schema migrations, run `supabase db dump`.

## Recovery Testing (Drill)
*To be performed quarterly.*
1. **Target:** Create a `recovery_test` Supabase project.
2. **Action:** Restore the latest production backup to the test project.
3. **Verification:** Confirm `clinics`, `patients`, and `appointments` tables are populated and encryption keys match (`pgcrypto` decrypt test).
4. **Conclusion:** If `decrypt_phi(encrypted_phone)` returns the original number in the test project, recovery is successful.

## Data Export (Clinic Exit)
If a clinic requests cancellation:
1. Run the `export_clinic_data` script (SQL function).
2. Provide a secure download link for CSV/JSON files.
3. Once download is confirmed, trigger `permanent_erasure_function`.

---
**Verification Date:** April 2026
**Status:** VALID
