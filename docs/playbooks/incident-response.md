# 🆘 Incident Response Plan
**Version:** 1.0 (Audit Rectification)
**Goal:** Maintain clinic trust during technical downtime or service degradation.

## Scenario A: Gupshup / WhatsApp API Downtime
*Effect: Reminders are not being sent; Inbox is non-responsive.*
1. **Detection:** Monitor `message_queue` for 'failed' status spikes (>10% failure rate).
2. **Notification (T+15 mins):** Send broadcast SMS (via MSG91) or manual WhatsApp to all Active Clinic Admins: 
   *"Hi, we're experiencing a temporary delay with our WhatsApp provider. Your reminders are queued and will be delivered once service restores. Please check your physical appointment book for the next 2 hours."*
3. **Resolution:** Monitor Gupshup Status Page. Once restored, trigger the `process-queue` cron manually.

## Scenario B: Supabase / Database Read-Only Mode
*Effect: App is slow or data cannot be saved.*
1. **Detection:** Sentry alerts or 500 errors on dashboard.
2. **Action:** Enable "Maintenance Mode" toggle in Vercel to show a friendly "Clinic Upgrade in Progress" page.
3. **Communication:** Email support@patientflow.ai to high-volume clinics.

## Scenario C: Data Breach / Unauthorized Access
*Effect: Patient data exposure.*
1. **Isolation:** Revoke all Supabase API keys immediately.
2. **Audit:** Check `audit_logs` to identify scope of export.
3. **Legal Compliance (T+72 hours):** In accordance with our BAA and DISHA commitments, notify every affected clinic owner with a detailed list of exposed records and mitigation steps taken.

---
**Emergency Contacts:**
- Founder: +91 XXXXX XXXXX
- Supabase Support: [Link]
- Gupshup Support: [Link]
