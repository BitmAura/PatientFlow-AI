# Co-founder checklist: What to check and do before you rely on this product

If I were you building Aura Recall / No-Show Killer, here’s what I’d verify and do—in order of impact.

---

## 1. Security & access (do first)

| Check | Status / action |
|-------|------------------|
| **CRON_SECRET** | Set in Vercel (and locally). Cron routes and middleware both enforce it. |
| **RLS on leads & lead_activities** | Migration `20260218_rls_leads_and_lead_activities.sql` exists. Run it in Supabase so “RLS Disabled” goes away for those tables. |
| **Other tables with RLS disabled** | Migration `20260218_rls_clinics_staff.sql` enables RLS on **clinics** and **staff**. Remaining tables (audit_logs, campaigns, etc.): add as needed. |
| **Service role key** | Never exposed to the client. Only used in server (cron, onboarding complete, webhooks). |
| **Webhook signatures** | Razorpay verifies `x-razorpay-signature`. Gupshup: optional `GUPSHUP_WEBHOOK_SECRET`—webhook checks `Authorization: Bearer` or `x-gupshup-token`. |

---

## 2. One full user journey (signup → first message)

Walk through as a new clinic owner:

1. **Signup** – Email, password, full name, **phone**, clinic name.  
   - Confirm phone is in auth `user_metadata` (used for display / future use).
2. **Email verification** – If you have “verify email” on, complete it.
3. **Onboarding** – Should redirect to `/onboarding` if no staff row.  
   - Step 1: Clinic details (name, phone, email, etc.).  
   - Step 2: Address.  
   - Step 3: **Complete** – must call `POST /api/onboarding/complete` and create clinic + staff.  
   - Then redirect to dashboard.
4. **Dashboard** – No “User not linked to a clinic” (guard + API fix should prevent that).
5. **Connect WhatsApp (Gupshup)** – Settings → WhatsApp → register **doctor’s number** → OTP → verify.  
   - Check `whatsapp_connections` has `provider: 'gupshup'`, `phoneNumberId` / `verified_number` = that number.
6. **Add a lead** – Leads → Add Lead (name, phone, source).  
   - Instant response should send WhatsApp **from doctor’s number** via Gupshup.
7. **Recalls / reminders** – Same: messages should go **from** doctor’s number **to** patients/leads.

If any step fails, fix that path before scaling.

---

## 3. Billing & subscription (don’t give away the product)

| Check | Status / action |
|-------|------------------|
| **Trial creation** | Trigger on `auth.users` insert creates a trial subscription. Confirm in DB after signup. |
| **Subscription gate** | **Done.** `sendWhatsAppMessage` checks clinic’s owner subscription (trialing/active, trial_end); returns skipped if no valid plan. |
| **Razorpay webhook** | Signature verified; events (activated, charged, cancelled, etc.) update DB. Ensure `RAZORPAY_WEBHOOK_SECRET` is set in production. |
| **Upgrade / downgrade** | APIs exist; confirm UI (e.g. Settings → Billing) actually calls them and reflects limits. |

---

## 4. Compliance & consent (health + messaging)

| Check | Status / action |
|-------|------------------|
| **STOP / opt-out** | Handled in both WhatsApp and Gupshup webhooks; leads and patients get marked opted out; recalls cancelled. Keep one place that “STOP” flows through so you don’t miss a channel. |
| **Template vs free-form** | For 24h+ inactive users, use approved templates (e.g. recall). Lead instant response and some reminders may be free-form—confirm with Meta/Gupshup policy. |
| **Data retention** | No clear retention or anonymization yet. Define policy (e.g. logs, PII) and add jobs or docs. |
| **Privacy policy / Terms** | **Done.** `/terms` and `/privacy` placeholder pages exist; signup links to `/terms`. Update copy for your jurisdiction. |

---

## 5. Reliability & ops

| Check | Status / action |
|-------|------------------|
| **Cron jobs** | `vercel.json` has send-reminders, process-campaigns, **leads**, **recalls**. In Vercel project settings, confirm crons are enabled and use the same `CRON_SECRET`. |
| **Cron client** | Lead and recall crons use **admin client** so they work with RLS. No change needed if you kept that. |
| **Rate limiting** | WhatsApp send path uses a rate limiter. Tune per clinic if you hit Gupshup/Meta limits. |
| **Errors** | **Done.** `src/lib/logger.ts`: `logError` / `logWarn` / `logInfo`. Wire PostHog in `logError` when `POSTHOG_API_KEY` is set. Gupshup webhook and send path use it. |
| **Reminder_logs** | **Done.** Migration `20260218_reminder_logs_patient_nullable.sql` makes `patient_id` nullable so lead messages can be logged. |

---

## 6. Product & schema hygiene

| Check | Status / action |
|-------|------------------|
| **DB vs code** | `lead_activities`: migration adds `actor_id` and `description`; code uses them. Run `20260218_lead_activities_actor_description.sql` if not already. |
| **lead_source enum** | TypeScript matches DB (`facebook_ad`, `google_ad`, `website`, `referral`, `manual`). Add lead form sources match this. |
| **Kanban** | “Invalid” column added so invalid leads are visible. |
| **Phase 3 (PWA)** | Swipe-to-action, bottom sheet nav, offline: still open. Prioritize if mobile is key. |

---

## 7. Docs & env (so the next person can run it)

| Check | Status / action |
|-------|------------------|
| **.env.example** | Has Supabase, app URL, cron secret, WhatsApp (Meta + Gupshup). New devs copy and fill. |
| **SETUP.md** | **Done.** Gupshup (Option A) and Meta (Option B), cron list (leads/recalls), env table. |
| **Single source of truth** | SETUP.md §7 lists env vars; `.env.example` has all keys. |

---

## 8. If I had one weekend: priority order

1. **Run RLS migration** for leads and lead_activities; confirm no “RLS Disabled” for them.  
2. **Do the full journey** once: signup → onboarding → connect Gupshup → add lead → see message from doctor’s number.  
3. **Gate sending on subscription** so expired trials don’t send.  
4. **Verify Gupshup webhook** – Optional `GUPSHUP_WEBHOOK_SECRET` is implemented.  
5. **Error monitoring** – Logger in place; add Sentry in `logError` and alert on cron failure.

Everything else (more RLS, retention, PWA) can follow once these are solid.
