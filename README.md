# PatientFlow AI

PatientFlow AI is a clinic operations platform that helps healthcare teams reduce missed appointments using automation, reminders, recall workflows, and conversion-focused lead follow-ups.

It is built for Aura Digital Services using Next.js + Supabase and supports WhatsApp delivery via Gupshup (primary) and Meta Cloud API (fallback/optional).

## What This Product Covers

- Appointment lifecycle management (booked, confirmed, checked-in, completed, no-show)
- Lead pipeline and follow-up automation
- Patient recall engine for reactivation
- WhatsApp-first communication flows (doctor number based)
- Online booking and patient portal actions
- Subscription-aware sending controls
- Dashboard analytics and operational reporting

## Core Features

### 1) Authentication and Onboarding
- Email/password and Google OAuth login
- Supabase Auth with server/client session handling
- Onboarding flow creates `clinic` + owner `staff` link
- Guard rails redirect users without staff linkage to onboarding

### 2) Dashboard and Operations
- Daily stats, upcoming appointments, and quick operational views
- Multi-role clinic workflows via `staff` and clinic scoping
- Responsive UI with desktop and mobile navigation patterns

### 3) Leads Engine
- Lead capture and Kanban board progression
- Status transitions with activity tracking
- Lead instant response through WhatsApp templates
- Dedicated cron endpoint for scheduled lead processing

### 4) Recall Engine
- Detects overdue/pending recalls
- Safe-send checks before automated outreach
- Tracks activities and outcomes for each recall
- Dedicated cron endpoint for daily recall execution

### 5) Reminders and Logs
- Reminder logs persisted in `reminder_logs`
- Supports nullable `patient_id` for lead-origin messages
- Webhook status updates for message delivery state

### 6) WhatsApp Integrations
- **Gupshup** (recommended): sends from doctor/clinic number
- **Meta Cloud API**: supported as alternative
- OTP verification flow to register/verify sender number
- Webhook verification support (`GUPSHUP_WEBHOOK_SECRET`)

### 7) Billing and Subscription Awareness
- Razorpay integration for subscription/deposit flows
- Sending controls respect clinic subscription/trial status

### 8) Security and Access Control
- RLS policies for `clinics`, `staff`, `leads`, `lead_activities`
- Additional policy to allow users to read own `staff` row
- Cron endpoints protected by `CRON_SECRET`

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling/UI**: Tailwind CSS, Radix UI, custom components
- **State/Data**: TanStack Query, Zustand
- **Backend/Data**: Supabase (Postgres + Auth + RLS)
- **Messaging**: Gupshup, Meta WhatsApp Cloud API
- **Payments**: Razorpay
- **Validation**: Zod + React Hook Form
- **Charts/Exports**: Recharts, jsPDF, xlsx
- **Deployment**: Vercel + Vercel Cron

## Repository Structure

```text
no-show-killer/
├── src/
│   ├── app/                    # Next.js routes, layouts, API handlers
│   │   ├── (auth)/             # Login/signup/onboarding UI routes
│   │   ├── (dashboard)/        # Protected app routes
│   │   ├── (public)/           # Public pages (terms/privacy/booking)
│   │   └── api/                # Server endpoints (cron, webhooks, CRUD)
│   ├── components/             # UI and feature components
│   ├── hooks/                  # Auth and feature hooks
│   ├── lib/                    # Core utilities, providers, services
│   ├── services/               # Domain services (lead/recall/etc.)
│   ├── stores/                 # Zustand stores
│   └── types/                  # Shared types and DB typings
├── supabase/
│   └── migrations/             # SQL migrations (schema + RLS policies)
├── docs/                       # Setup, API, features, troubleshooting
├── public/                     # Static assets
└── vercel.json                 # Cron schedule configuration
```

## Local Development

### Prerequisites
- Node.js 18+
- npm
- Supabase CLI (`npx supabase ...`)
- A Supabase project

### 1) Install Dependencies
```bash
npm install
```

### 2) Configure Environment
Use `.env.example` as your source of truth and create `.env.local` with the same keys.

Minimum required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

For WhatsApp via Gupshup:
- `GUPSHUP_APP_ID`
- `GUPSHUP_APP_TOKEN` (or `GUPSHUP_API_KEY`)
- Optional: `GUPSHUP_BASE_URL`, `GUPSHUP_WEBHOOK_SECRET`

### 3) Apply Database Migrations
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 4) Run the App
```bash
npm run dev
```

### 5) Build Check
```bash
npm run build
```

## Auth Configuration (Important)

In Supabase `Authentication -> URL Configuration`:

- Set Site URL:
  - Dev: `http://localhost:3000`
  - Prod: your real domain (example: `https://app.auradigitalservices.me`)
- Add Redirect URLs:
  - `http://localhost:3000/api/auth/callback`
  - `https://<your-domain>/api/auth/callback`

If redirect URLs are wrong/missing, login can fail with `"Failed to fetch"` or callback errors.

## Cron Jobs

Defined in `vercel.json`:

- `/api/cron/recalls` at `0 8 * * *`
- `/api/cron/leads` at `0 9 * * *`
- `/api/cron/send-reminders` at `0 10 * * *`
- `/api/cron/process-campaigns` at `0 11 * * *`

All cron routes require:

```http
Authorization: Bearer <CRON_SECRET>
```

## Key API Areas

- `api/onboarding/complete` - creates clinic and owner staff link
- `api/cron/leads` - lead automation batch
- `api/cron/recalls` - recall automation batch
- `api/webhooks/gupshup` - Gupshup status updates
- `api/webhooks/whatsapp` - Meta WhatsApp updates
- `api/whatsapp/verify-otp` - sender number verification flow

For endpoint details, see `docs/API.md`.

## Database and RLS Notes

Important migration highlights:

- Lead activity schema alignment (`actor_id`, `description`)
- RLS for leads and lead activities
- RLS for clinics and staff
- `reminder_logs` compatibility and nullable `patient_id`
- Policy to allow authenticated users to read their own `staff` row

Run all migrations in `supabase/migrations` in order via `supabase db push`.

## WhatsApp Provider Strategy

At send time the app selects provider based on connection/session data:

- If clinic session is marked `gupshup` (or Gupshup credentials are present), send through Gupshup.
- Otherwise, fallback to Meta Cloud API settings.

This enables messages to be sent from the clinic/doctor number after OTP verification.

## Deployment

Recommended: Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Add all environment variables from your `.env.local`
4. Deploy
5. Set Supabase auth URLs and webhook callback URLs to production domain

Detailed guide: `docs/SETUP.md`.
Deployment guardrails: `docs/DEPLOYMENT_CHECKLIST.md`.

## Documentation Index

- Setup: `docs/SETUP.md`
- Features: `docs/FEATURES.md`
- API: `docs/API.md`
- WhatsApp quick setup: `docs/WHATSAPP-SIMPLE-SETUP.md`
- WhatsApp troubleshooting: `docs/WHATSAPP-TROUBLESHOOTING.md`
- Deployment checklist: `docs/DEPLOYMENT_CHECKLIST.md`
- Schema drift notes: `docs/SCHEMA_DRIFT_NOTES.md`
- Co-founder checklist: `docs/COFOUNDER-CHECKLIST.md`
- Product brief: `docs/PRODUCT_BRIEF.md`

## Ownership

Proprietary software by Aura Digital Services.



// PatientFlow AI — Complete Business & Technical Assessment
What You Actually Built

Not a doctor booking app. Not another Practo clone.

You built a clinic operations back-office SaaS — the internal tools a clinic needs to stop losing patients and revenue after the first appointment. The core engine is:

Automated WhatsApp-first patient recall + appointment lifecycle management + lead conversion for independent clinics.

That's a fundamentally different problem than what Practo/Apollo solve.

The Core Problem You're Solving

Apollo, Practo, Healthplex — what they do:
Connect patients TO doctors (discovery + booking marketplace)

They own the patient relationship
Clinics pay them per lead/listing
Clinics are commoditized on their platform

What THEY DON'T solve (and you do):
A clinic books 50 appointments → 12 don't show up → ₹24,000 in lost revenue that day alone

200 patients haven't returned in 6 months → nobody follows up → they go somewhere else

A lead comes in via Instagram → staff forgets to call → lost
Doctor completes a treatment → no recall scheduled → patient never comes back

The real problem: Independent clinics (dental, physio, dermat, eye, ortho, gynaec) are terrible at retention and follow-up because they have no automation. Their "CRM" is a WhatsApp group and a paper register.

Who This Is For — Target Market

Primary Target: Independent Specialty Clinics in India
Segment	Size	Pain
Dental clinics	~2.5 lakh in India	Recalls are critical (6-month cleanings, follow-up fillings)

Physiotherapy	~80,000+	Multi-session patients must come back — dropout = zero revenue

Dermatology/Skin	~60,000+	Treatment plans span weeks — dropout = incomplete results + refunds

Ophthalmology	~50,000+	Annual checkups, lens followups

Gynaecology/OB	~40,000+	Prenatal series, annual visits

Orthopaedic	~35,000+	Post-surgery rehab is recall-heavy

Aesthetics/Cosmetic	~30,000+	Repeat Botox, laser sessions — pure retention business

Total addressable market (India): ~5-8 lakh independent clinics. Even 0.1% = 500-800 paying clinics.

Secondary Target: Small Multi-Doctor Practices (2-10 doctors)
These are outgrowing paper but can't afford enterprise EMR. Perfect for your Growth plan.

Who You Are NOT for (and shouldn't try to be):

Hospitals (need full EMR, OPD, IPD, lab, pharmacy)

Apollo/Fortis/Max (have in-house systems)

Large diagnostic chains (different problem)

Competitive Positioning — Why You're Not Competing with Practo

Feature	Practo	Apollo247	PatientFlow AI

Patient discovery	Yes	Yes	No (not your job)

Appointment booking	Yes	Yes	Yes (for existing patients)

Patient recall automation	No	No	Yes — core feature

WhatsApp-first comms	No	No	Yes — native

Lead management	No	No	Yes

No-show recovery	No	No	Yes

Campaign engine	No	No	Yes

Revenue impact tracking	No	No	Yes

Clinic-owned patient data	No (Practo owns it)	No	Yes — clinic keeps data

Monthly cost to clinic	₹3,000-10,000/yr (listing)	Pay per lead	₹2,999-14,999/mo

Your positioning line should be:

"While Practo brings patients to your clinic, PatientFlow AI makes sure they never stop coming back."

Your real competitor is: Cliniko, Carepatron, SimplePractice (international), GoFrugal (India) — none of which have strong WhatsApp-native recall engines for the Indian market.

Your Pricing — Honest Analysis
Plan	Price/mo	Annual	Who it's for	My Take

Starter	₹2,999	₹28,790	1-doctor clinic, <500 appts/mo	Priced right. Under ₹100/day — easy yes.

Growth	₹8,999	₹86,390	Multi-doctor, growing clinic	Slightly high for India. ₹6,999 might convert better.

Pro	₹14,999	₹1,43,990	Large multi-location practices	Fair for the value. Needs dedicated onboarding to justify.

Can You Make Money?
Yes. Here's the math:

Conservative Year 1:

100 Starter clinics × ₹2,999 = ₹2,99,900/mo
30 Growth clinics × ₹8,999 = ₹2,69,970/mo
10 Pro clinics × ₹14,999 = ₹1,49,990/mo
Monthly Recurring Revenue: ~₹7.2 lakhs
Annual: ₹86 lakhs ($1M ARR)
Costs (estimated):

Supabase: ~$500-1500/mo at scale
Vercel: ~$200-500/mo
Gupshup/WhatsApp: ~₹0.35/message × volume
Razorpay: 2% transaction fee

Support/ops: 1-2 people

At 140 clinics paying, you're profitable. The unit economics work.

Your value prop to the clinic: One no-show = ₹1,500-5,000 lost. If you recover even 10 patients/month = ₹15,000-50,000 value. You're charging ₹2,999. That's a 5-15x ROI. Sell the ROI, not the features.

Gaps You MUST Fix Before Launch
Critical (Blockers):
Email reminders broken — Resend is configured but routes not fully wired. Many clinics don't have patient WhatsApp. This is a launch blocker.

No message retry/queue — If Gupshup goes down, messages fail silently. You need a simple retry queue (even a Supabase queue table with retry logic).

WhatsApp template pre-approval — Gupshup/Meta require pre-approved message templates. You need a set of 5-7 approved templates ready before any clinic can go live. This takes 2-3 weeks.

No 2FA on staff login — If a clinic's staff account is compromised, all patient data is exposed. Add OTP-based 2FA.

Trial → Paid conversion UI — Trial expiry flow needs to be bulletproof with clear warnings at 7 days, 3 days, 1 day remaining.

Important (Pre-Growth):
Onboarding wizard — Right now a new clinic owner lands and has to figure things out. You need a 5-step guided setup: clinic info → add doctor → add services → connect WhatsApp → test reminder. Every step they skip = churn.

Demo data for trials — Load 50 fake patients, 10 leads, some recalls into every trial account. Let them experience the product value before they add their own data. This is the single biggest trial-to-paid conversion lever.

DISHA data residency — Your migration file exists but compliance isn't validated. For healthcare data in India, you need your Supabase project hosted in Mumbai (ap-south-1). Confirm this.

Audit log UI — Clinics' doctors will ask "who deleted this patient?" — you need basic activity history visible.

Mobile-responsive dashboard — Clinic staff often use phones. Check all key flows on mobile.

Nice to Have (Post-PMF):
Custom reminder templates per clinic
Patient feedback collection post-visit
SMS fallback (MSG91 already configured, just needs wiring)
Staff performance attribution in recall reports
Campaign scheduling (specific time, not just cron)
How It Works — Simple Flow

Clinic signs up (14-day free trial)
    ↓
Onboarding: Add doctors, services, connect WhatsApp
    ↓
Staff adds patients & books appointments
    ↓
System auto-sends reminders (48hr, 24hr, 2hr before)
    ↓
No-show? → Patient goes into recall queue
    ↓
Daily cron: Sends personalized WhatsApp recall
    ↓
Patient responds → Staff converts in lead board
    ↓
Clinic tracks: no-shows recovered, revenue impact
    ↓
Reports show: "You recovered ₹42,000 this month"
    ↓
Clinic upgrades to Growth plan for campaigns
Go-to-Market Strategy
Month 1-3: Manual Founder Sales
Target dental clinics in your city personally
Offer 3-month free for first 10 "design partner" clinics
Get them on a call, do their onboarding yourself
Learn what's actually painful — not what you assumed
Month 3-6: Content + Community
YouTube/Instagram: "How to reduce no-shows in your dental clinic"
Target clinic owners, not doctors
WhatsApp groups for clinic managers are where your buyers live
Dental association tie-ups (IDA chapters) = bulk access
Month 6+: Paid Acquisition
Google Ads: "clinic management software India", "reduce no-shows dental"
Meta Ads targeting clinic owners/managers
Cost per acquisition should be under ₹5,000 at Starter plan (1.67 months payback)
What Needs to Happen This Week
Priority	Task	Why
P0	Get WhatsApp templates approved with Gupshup	Nothing works without this
P0	Wire email reminder channel (Resend)	Some patients won't have WhatsApp
P0	Test full flow end-to-end with a real clinic	Find breaks before customers do
P1	Build 5-step onboarding wizard	Reduces churn in trial
P1	Load demo data into new trial accounts	Shows value immediately
P1	Add Razorpay test → production key swap	Can't take money otherwise
P2	Confirm Supabase Mumbai region	Data compliance
P2	Add retry logic for failed WhatsApp sends	Reliability
Honest Verdict
Is this ready to deploy? — Yes for a paid beta / design partner phase. Not yet for fully self-serve at scale.

Is this a real business? — Yes. The problem is real, the market is large, the unit economics work, and your positioning vs Practo/Apollo is defensible because you're solving a completely different problem.

Biggest risk: WhatsApp as the primary channel. Meta can change API pricing/policies. You need SMS and email as strong fallbacks, not afterthoughts.

Unfair advantage you have: WhatsApp-native recall for Indian clinics, built in INR, with Gupshup integration for verified clinic numbers. No international player has this. This is your moat — double down on it.

What to name the core value prop in all your marketing:

"PatientFlow AI pays for itself the first time it fills a cancelled slot."

Want me to fix any of the critical gaps // 