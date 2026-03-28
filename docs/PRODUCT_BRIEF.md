# PatientFlow AI - Product Brief

## 1) What We Are Building

PatientFlow AI is a clinic growth and operations platform that turns missed inquiries into booked appointments and reduces no-shows through WhatsApp-first automation.

The product is built for Indian clinics (dental, skin, general, and multi-specialty) that need:
- faster lead response,
- better appointment show-up rates,
- automated recall and follow-up,
- measurable monthly ROI.

## 2) What Problem We Are Solving

Most clinics lose revenue in 3 predictable places:
- Inquiry leakage: Front desk teams cannot reply instantly, so high-intent leads go cold.
- No-show leakage: Patients forget appointments or do not confirm in time.
- Reactivation leakage: Past patients are not recalled consistently, reducing repeat revenue.

Result: Clinics spend on lead generation but lose conversion and retention due to manual follow-up gaps.

## 3) How We Solve It

### A) Lead-to-Booking Automation
- Instant WhatsApp response to new inquiries.
- Guided booking conversation (slot suggestion + confirmation).
- Structured lead tracking through pipeline statuses.

### B) Reminder and No-Show Prevention
- Automated reminders before appointments.
- Confirmation nudges and follow-up sequences.
- No-show recovery prompts (reschedule journey).

### C) Recall and Retention Engine
- Detect inactive patients by time window.
- Send personalized reactivation campaigns.
- Track outcomes in logs and dashboard metrics.

### D) Revenue Visibility for Owners
- Dashboard KPIs for leads, bookings, and conversion flow.
- Performance tracking for operational decisions.
- Subscription-aware controls to align usage with plan limits.

## 4) Product Scope (Current)

- Authentication, onboarding, and role-based access.
- Dashboard and operational modules (appointments, patients, leads, reminders).
- WhatsApp integrations (Gupshup primary, Meta Cloud API fallback/optional).
- Billing with Razorpay and plan-aware limits.
- Public marketing pages (landing, pricing, signup flow).
- API + cron automation for recalls, leads, and reminders.

## 5) Tech Stack We Use

- Frontend: Next.js 14 App Router, React 18, TypeScript.
- UI: Tailwind CSS, Radix UI, custom component system.
- Backend: Supabase (Postgres, Auth, Row Level Security).
- Messaging: Gupshup and Meta WhatsApp Cloud API.
- Payments: Razorpay subscriptions.
- State and forms: TanStack Query, Zustand, React Hook Form, Zod.
- Charts/reports: Recharts, jsPDF, xlsx.
- Deploy: Vercel (including scheduled cron jobs).

## 6) Architecture and Security Principles

- Multi-tenant by design: clinic-scoped data access.
- Row Level Security on sensitive tables.
- Server-side privileged actions use admin/service-role context only where required.
- Signed webhook handling and cron secret protection.
- Backward-compatible plan handling via plan normalization.

## 7) Pricing and Packaging Direction (Implemented)

Canonical plans are now:
- Starter
- Growth
- Pro

Recent work aligned pricing contract across:
- public landing and pricing pages,
- signup and billing experience,
- subscription API endpoints,
- legacy plan ID compatibility.

## 8) Recent Phase Completed

Phase 1 execution delivered:
- unified pricing source of truth,
- normalized legacy plan mapping,
- billing and webhook reliability improvements,
- RLS hardening migration for journey/reminder tables,
- deployment and schema-drift documentation.

## 9) What Is Next

Immediate next milestone:
- premium SaaS UI pass for stronger market positioning (hero, CTAs, cards, trust blocks, conversion polish).

Following milestones:
- analytics and ROI storytelling upgrades,
- deeper sales/demo funnel instrumentation,
- enterprise operational controls for multi-location clinics.

## 10) Success Metrics

Primary outcomes we optimize for:
- lead response time,
- lead-to-booking conversion rate,
- appointment show-up rate,
- reactivation rate,
- recovered monthly revenue.

---

For implementation and setup details, see:
- `README.md`
- `docs/FEATURES.md`
- `docs/API.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/SCHEMA_DRIFT_NOTES.md`
