# PatientFlow AI — No-Show Killer
### Built by Aura Digital Services · Made in India 🇮🇳

> **Stop losing ₹40,000+/month to missed appointments.**  
> PatientFlow AI is a clinical revenue recovery platform that automates WhatsApp reminders, patient recalls, and lead follow-ups — so Indian clinics never lose a patient to a forgotten appointment again.

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [The Problem We Solve](#the-problem-we-solve)
3. [What We've Built (Full System Audit)](#whats-built)
4. [Architecture Overview](#architecture-overview)
5. [Tech Stack](#tech-stack)
6. [The Three Engines](#the-three-engines)
7. [Database Schema](#database-schema)
8. [API & Cron Jobs](#api--cron-jobs)
9. [Pricing & Billing](#pricing--billing)
10. [WhatsApp Integration](#whatsapp-integration)
11. [Getting Started (Local Dev)](#getting-started)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)
14. [Security & Compliance](#security--compliance)
15. [What's Missing / Roadmap](#whats-missing--roadmap)
16. [For Co-Founders & Investors](#for-co-founders--investors)

---

## What This Is

**PatientFlow AI** (formerly "No-Show Killer") is a multi-tenant SaaS platform built for Indian dental, skin, and healthcare clinics. It solves one specific, expensive problem: **patients who book appointments but don't show up.**

A clinic with 20 no-shows per month at ₹2,000 per appointment loses ₹40,000 every single month. Multiply that across 500 clinics and you have ₹2 crore/month in recoverable revenue sitting on the table.

We automate the entire recovery loop with WhatsApp — the most-used messaging app in India.

---

## The Problem We Solve

| Problem | Industry Average | PatientFlow AI |
|---|---|---|
| No-show rate | 20–30% | < 8% |
| Time to respond to new lead | 4+ hours | < 5 minutes (automated) |
| Patients recovered after 6 months | 0% | ~35% with recall engine |
| Staff time spent on reminders | 2–3 hours/day | ~10 minutes (review only) |

---

## What's Built

### ✅ Customer-Facing (Public)
- **Landing Page** — Full high-conversion page with ROI calculator, WhatsApp flow simulation, FAQs, and live pricing
- **Pricing Page** — Monthly/Annual toggle, 3 tiers (Starter/Growth/Pro), integrated with Razorpay
- **How It Works** — Step-by-step explainer page
- **Recall Engine Explainer** (`/how-recall-works`) — Dedicated SEO page for the recall product
- **Location Pages** — Mumbai, Delhi, Bangalore (SEO geo-targeting)
- **Features Page** — Full feature breakdown
- **Online Booking** (`/book/:clinicSlug`) — Public-facing booking page per clinic
- **Patient Portal** (`/(patient-portal)`) — Patient self-service portal
- **Enrollment Page** (`/enroll`) — Clinic sign-up flow
- **Legal Pages** — Privacy Policy, Terms of Service (DISHA-compliant)
- **Blog** — Blog infrastructure (content-ready)

### ✅ Auth System
- **Sign Up / Login** — Email + Password with email OTP verification
- **2FA** — Two-factor authentication layer in database
- **Session Management** — Supabase SSR auth with secure cookie handling
- **Middleware** — Route protection for all dashboard and API routes

### ✅ Clinic Dashboard (Staff)
- **Appointments** — Calendar view, create/edit/cancel appointments, doctor assignment
- **Patients** — Full patient record management, lifecycle tracking, opt-in/opt-out
- **Leads** — Kanban-style CRM pipeline (New → Contacted → Responsive → Booked → Lost)
- **Reminders** — Configure 24h and 2h WhatsApp, SMS, email reminders
- **Recalls** — View, manage, and manually trigger patient recall campaigns
- **Follow-ups** — Structured follow-up scheduling for leads and patients
- **Campaigns** — Broadcast WhatsApp campaign management
- **Journeys** — Visual patient journey template builder (N-step automated sequences)
- **Inbox** — Incoming WhatsApp message inbox from patients
- **Waiting List** — Smart waiting list with auto-fill for cancellations
- **Services** — Clinic service/treatment catalog with pricing
- **Reports** — Staff performance view, ROI report, founder brief
- **Settings** — WhatsApp connection, business hours, clinic profile, notification preferences

### ✅ Owner / Founder Layer
- **Morning Intelligence Brief** — Daily automated summary: new leads, recalls sent, recovered revenue
- **Staff Performance View** — Supabase view tracking staff response times and conversion
- **Founder ROI Tracking** — Revenue recovery calculations based on treatment tiers
- **Audit Logs** — All system actions are logged for accountability

### ✅ Backend Services

#### Lead Service (`src/services/lead-service.ts`)
- State machine enforcement: strict transitions (new → contacted → booked)
- **Lead Leak Detection**: Flags enquiries not responded to within 5 minutes
- **Instant Response Engine**: Auto-sends WhatsApp greeting the moment a lead is created
- **Drip Follow-up**: Day +1, +3 follow-ups; Day +5 escalation to staff
- **Opt-out Handling**: Global phone blacklist synced across all engines
- **Anti-spam Idempotency**: 12-hour deduplication window

#### Recall Service (`src/services/recall-service.ts`)
- Patient score calculation by treatment tier (Implants > Cleanings)
- Business hours enforcement (per-clinic custom hours)
- Journey cooldown (7 days post-journey before recall triggers)
- 3-attempt cap with status tracking: `pending → overdue → contacted → booked/cancelled`
- Staff outcome recording (Booked / Not Interested / Call Later / Wrong Number)
- Money Leak List: Top 50 overdue patients ranked by days overdue + revenue potential

#### Recall Cron (`src/lib/recall-cron.ts`)
- Daily automated batch: seeds inactive patients into recall queue (30-day, 60-day)
- Treatment-tier-based prioritization
- Sends WhatsApp via Gupshup API (plain text or template)

#### WhatsApp Service (`src/services/whatsapp-service.ts`)
- Per-clinic configuration override
- Gupshup integration (primary provider)
- Message queuing and retry logic
- Webhook handler for inbound messages and opt-outs

### ✅ Billing & Subscriptions
- **Razorpay Integration** — Subscription creation, webhook handling
- **3 Tiers**: Starter (₹2,999/mo), Growth (₹8,999/mo), Pro (₹14,999/mo)
- **Annual Discount** — 20% off with annual billing
- **Usage Guard** — Monthly message cap enforcement (blocks sends on quota breach)
- **14-Day Free Trial** — Full feature access, no credit card required
- **Subscription Guard** — All message-sending checks subscription status first

### ✅ Automation (Cron Jobs)
- **`/api/cron/send-reminders`** — 10 AM daily: WhatsApp 24h reminders
- **`/api/cron/process-campaigns`** — 11 AM daily: campaign broadcasts
- **`/api/cron/leads`** — 9 AM daily: auto follow-ups for leads
- **`/api/cron/recalls`** — 8 AM daily: patient recall batch processing

### ✅ Security & Compliance
- **Row Level Security (RLS)** — All 20+ Supabase tables secured; staff can only see their clinic's data
- **DISHA Compliance** — India's Digital Information Security in Healthcare Act
- **Admin Client Isolation** — Cron jobs run with a service-role key; no RLS bypass for user operations
- **CRON_SECRET** — All cron endpoints protected with a Bearer token
- **Webhook Signature Verification** — Gupshup webhook validated with secret

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 PATIENTFLOW AI                       │
│─────────────────────────────────────────────────────│
│                                                      │
│  PUBLIC SITE                DASHBOARD                │
│  /landing                   /dashboard/*             │
│  /pricing                   /appointments            │
│  /book/:slug                /patients                │
│  /how-it-works              /leads (Kanban)          │
│  /enroll                    /recalls                 │
│  /blog                      /reports                 │
│                             /settings/whatsapp       │
│                                                      │
│─────────────────────────────────────────────────────│
│                   NEXT.JS APP ROUTER                 │
│─────────────────────────────────────────────────────│
│                                                      │
│  API LAYER (/api/*)                                  │
│  ├── /api/cron/*        (Vercel Cron Jobs)           │
│  ├── /api/webhooks/*    (Gupshup Inbound)            │
│  ├── /api/subscription  (Razorpay)                   │
│  ├── /api/appointments  (CRUD)                       │
│  ├── /api/leads         (CRUD + Actions)             │
│  └── /api/patients      (CRUD)                       │
│                                                      │
│─────────────────────────────────────────────────────│
│                   SERVICE LAYER                      │
│                                                      │
│  LeadService  ←→  RecallService  ←→  WhatsAppService │
│       ↕                ↕                   ↕         │
│  lead_service.ts  recall-cron.ts   gupshup/          │
│                                                      │
│─────────────────────────────────────────────────────│
│                  DATABASE (SUPABASE)                 │
│                                                      │
│  clinics        patients        appointments         │
│  leads          patient_recalls reminder_logs        │
│  staff          lead_activities recall_activities    │
│  subscriptions  journey_templates patient_journeys   │
│  gupshup_config waiting_list    patient_messages     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict) |
| **Database** | Supabase (PostgreSQL + Realtime) |
| **Auth** | Supabase Auth (Email OTP + 2FA) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **WhatsApp** | Gupshup Business API |
| **Payments** | Razorpay Subscriptions |
| **Monitoring** | Sentry (Edge + Server) |
| **Analytics** | PostHog |
| **Deployment** | Vercel (with Cron) |
| **Email** | Nodemailer / Custom SMTP |

---

## The Three Engines

### Engine 1: The Lead Discipline Engine
**Mission**: Convert every enquiry into a booking before they call a competitor.

```
New Lead Created
       ↓
Instant WhatsApp Response (< 5 min, automated)
       ↓
Status → "contacted"
       ↓
Day +1: "Do you have questions?" WhatsApp
       ↓
Day +3: "Slots are filling up!" WhatsApp
       ↓
Day +5: Escalation → Staff "Priority Call List"
       ↓
Staff marks outcome → Booked / Lost / Invalid
```

**Key Metric**: Lead Leak Count (visible on owner dashboard)

---

### Engine 2: The No-Show Prevention Engine
**Mission**: Ensure every booked patient actually shows up.

```
Appointment Created
       ↓
T-24h: "Reminder + Confirm?" WhatsApp (interactive)
       ↓
Patient Replies: CONFIRM / RESCHEDULE
       ↓
T-2h: "See you soon!" Nudge (if confirmed)
       ↓
Appointment Time Passes
       ↓
If no-show detected → Recovery WhatsApp sent
       ↓
Staff Follow-up if not rescheduled in 4h
```

**Key Metric**: Recovery Rate (% of missed appointments rescheduled)

---

### Engine 3: The Patient Recall Engine
**Mission**: Recover revenue from patients who haven't visited in 30-90 days.

```
Nightly Cron (8 AM)
       ↓
Scan patients inactive for 30+ days
       ↓
Create overdue recall records
       ↓
Score by treatment tier (Implants first)
       ↓
Send WhatsApp recall message (Attempt 1 of 3)
       ↓
Patient Books → Status: "booked"
Patient Ignores → Retry Day 3, Day 7
3 Failures → Staff "Money Leak List"
```

**Key Metric**: Monthly Recovered Revenue (₹ shown on dashboard)

---

## Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `clinics` | Multi-tenant root. Every record belongs to a clinic. |
| `staff` | Clinic staff linked to auth users. Role-based. |
| `patients` | Patient records with lifecycle stage tracking. |
| `appointments` | Appointment calendar with reminder-sent flags. |
| `leads` | CRM leads with state machine status. |
| `lead_activities` | Full audit trail of every action on a lead. |
| `patient_recalls` | Recall queue with attempt tracking. |
| `recall_activities` | Audit trail for recall actions. |
| `reminder_logs` | Every message sent, with status and errors. |
| `patient_journeys` | N-step automated journey instances. |
| `journey_templates` | Reusable journey blueprints. |
| `subscriptions` | Razorpay subscription records. |
| `gupshup_config` | Per-clinic WhatsApp API credentials. |
| `patient_messages` | Inbound/outbound message history. |
| `waiting_list` | Cancellation recovery waiting list. |

### Key Enums

```sql
-- Patient lifecycle
CREATE TYPE patient_lifecycle_stage AS ENUM (
  'prospect', 'active', 'inactive', 'recall_pending',
  'recall_booked', 'visited', 'opted_out'
);

-- Lead pipeline
CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'responsive', 'booked', 'lost', 'invalid'
);

-- Recall queue
CREATE TYPE recall_status AS ENUM (
  'pending', 'overdue', 'contacted', 'booked', 'cancelled', 'completed'
);
```

---

## API & Cron Jobs

### Cron Schedule (vercel.json)

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/recalls` | 8 AM daily | Recall batch processing |
| `/api/cron/leads` | 9 AM daily | Lead follow-up automation |
| `/api/cron/send-reminders` | 10 AM daily | Appointment reminders |
| `/api/cron/process-campaigns` | 11 AM daily | Campaign broadcasts |

All cron endpoints require `Authorization: Bearer <CRON_SECRET>`.

### Key API Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/appointments` | GET/POST/PATCH | Appointment CRUD |
| `/api/leads` | GET/POST/PATCH | Lead pipeline management |
| `/api/patients` | GET/POST/PATCH | Patient records |
| `/api/recalls` | GET | Recall engine read |
| `/api/subscription/subscribe` | POST | Create Razorpay subscription |
| `/api/webhooks/whatsapp` | POST | Gupshup inbound webhook |
| `/api/webhooks/razorpay` | POST | Payment webhook |
| `/api/whatsapp/send` | POST | Manual message send |
| `/api/booking/:slug` | GET/POST | Public booking endpoint |

---

## Pricing & Billing

| Plan | Monthly | Annual | Appointments | WhatsApp | Doctors |
|---|---|---|---|---|---|
| **Starter** | ₹2,999 | ₹28,790 | 500/mo | 500/mo | 3 |
| **Growth** | ₹8,999 | ₹86,390 | 2,000/mo | 2,000/mo | 10 |
| **Pro** | ₹14,999 | ₹1,43,990 | Unlimited | Unlimited | Unlimited |

All plans include a **14-day free trial** (no credit card required).

---

## WhatsApp Integration

We use **Gupshup** as our primary WhatsApp Business API provider.

### Per-Clinic Setup
Each clinic can have their own Gupshup credentials stored in the `gupshup_config` table. This allows clinics to use their own registered WhatsApp Business number.

### Message Types
1. **Transactional** — Appointment reminders (plain text, 24-hour window)
2. **Template Messages** — Recall campaigns (pre-approved templates, for cold outreach)

### Setting Up Gupshup
1. Register at [gupshup.io](https://gupshup.io)
2. Create a WhatsApp Business App
3. Get your `APP_ID`, `APP_TOKEN`, and `Source Number`
4. Configure in Dashboard → Settings → WhatsApp
5. (Or add to ENV for agency-level default)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Gupshup account
- A Razorpay account (for payments)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/patientflow-ai.git
cd patientflow-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in the values — see Environment Variables section below
```

### 4. Run Supabase migrations

```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Push all migrations
npx supabase db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# ─── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...         # Server-only, never expose to client

# ─── Gupshup (WhatsApp) ────────────────────────────
GUPSHUP_APP_ID=your-app-id
GUPSHUP_APP_TOKEN=your-app-token
GUPSHUP_SOURCE_NUMBER=919876543210          # Your registered WhatsApp number
GUPSHUP_WEBHOOK_SECRET=your-webhook-secret

# ─── Razorpay (Payments) ───────────────────────────
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx  # Public key only

# ─── Cron Security ─────────────────────────────────
CRON_SECRET=a-long-random-secret-string

# ─── App Config ────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://auradigitalservices.me
NEXT_PUBLIC_WHATSAPP_SALES_URL=https://wa.me/91XXXXXXXXXX

# ─── Monitoring (Optional) ─────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Deployment

The app is deployed on **Vercel** at `auradigitalservices.me`.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/patientflow-ai)

### Manual Deploy Steps

1. Push to `main` branch — Vercel auto-deploys
2. Set all environment variables in Vercel Dashboard → Settings → Environment Variables
3. Cron jobs are automatically registered via `vercel.json`
4. Point your domain to Vercel

### Production Checklist
- [ ] All ENV variables set in Vercel
- [ ] Supabase migrations applied to production DB
- [ ] Gupshup Webhook URL set to `https://yourdomain.com/api/webhooks/whatsapp`
- [ ] Razorpay Webhook URL set to `https://yourdomain.com/api/webhooks/razorpay`
- [ ] `CRON_SECRET` set and secured
- [ ] Sentry project connected for error monitoring

---

## Security & Compliance

### Data Security
- **Row Level Security (RLS)** on every table — staff can only query their own clinic's data
- **Service Role Key** is only used server-side in cron jobs and admin operations
- **JWT Verification** on all authenticated API routes via Supabase middleware
- **CRON Bearer Token** on all automation endpoints

### India Healthcare Compliance
- **DISHA Compliant** — Digital Information Security in Healthcare Act
- Patient opt-out respected globally across all 3 engines
- No patient data shared across clinics (multi-tenant isolation)
- WhatsApp messages include opt-out instructions

### Anti-Spam Architecture
- **Idempotency Window** — 12-hour deduplication on follow-up sends
- **Attempt Caps** — Max 3 recall attempts, max 3 lead follow-ups
- **Business Hours Check** — No messages sent outside 9 AM – 7 PM
- **Active Journey Lock** — Automation paused if patient is in an active journey
- **Cross-Engine Guard** — Lead engine checks for active recall; recall checks for active journey

---

## What's Missing / Roadmap

### Immediate (Need to Build)
- [ ] **Appointment Reminder Cron** — `/api/cron/send-reminders` logic incomplete
- [ ] **Inbound Webhook Handler** — `/api/webhooks/whatsapp` needs full opt-out and reply handling
- [ ] **Dashboard Main Page** — Owner ROI dashboard needs live data hookup
- [ ] **CSV Import** — Patient bulk import for new clinic onboarding
- [ ] **Appointment Confirmation Flow** — Interactive WhatsApp buttons for T-24h confirmation

### Phase 2
- [ ] **Google Calendar Sync** — Two-way sync with clinic's Google Calendar
- [ ] **SMS Fallback** — Twilio/MSG91 SMS for patients not on WhatsApp
- [ ] **Review Collection** — Post-visit Google Review request automation
- [ ] **Multi-location Billing** — Per-location subscription and reporting

### Phase 3
- [ ] **EMR Integration** — REST API connectors for popular Indian EMRs
- [ ] **Deposit Collection** — Razorpay payment link for high-value appointment deposits
- [ ] **Staff Mobile App** — PWA for on-the-go lead and recall management

---

## For Co-Founders & Investors

### The Market

- **500,000+** clinics in India
- Average no-show rate: **22%**
- Average appointment value: **₹1,500–₹25,000** (dental/dermatology)
- **Target**: Top 5% of clinics (organized, digital-first) → ~25,000 clinics

### Why We Win

1. **WhatsApp-native** — Not email, not SMS. WhatsApp has 99% open rates in India.
2. **Treatment-tier intelligence** — We prioritize implant patients over cleaning patients. Competitors don't.
3. **Three-engine architecture** — Lead → No-Show → Recall. We own the entire revenue lifecycle, not just reminders.
4. **Clinic-discipline, not patient-discipline** — We enforce response time SLAs on the staff, not just the patient.
5. **DISHA-ready** — Built for India's healthcare data regulations from Day 1.

### Revenue Model

- **SaaS Subscriptions** — ₹2,999 to ₹14,999/month
- **NRR > 120%** — Clinics expand to Growth/Pro plans as they grow
- **Agency White-label** — Agencies can resell under their own brand (coming)

### Key Metrics to Watch

| Metric | Target |
|---|---|
| Monthly Recurring Revenue | ₹10L by Month 6 |
| Clinics Onboarded | 100 by Month 6 |
| Avg No-Show Rate Reduction | 60% within 30 days |
| Net Revenue Retained | > 110% |

---

## Contributing

This is a private repository. For internal team members:

1. Branch from `main` with format `feat/`, `fix/`, `chore/`
2. All PRs require review from the tech lead
3. Migrations must be tested locally before merging

---

## License

Copyright © 2026 Aura Digital Services. All rights reserved.

---

*Built with precision by the Aura Digital Services engineering team.*  
*Questions? Contact: [team@auradigitalservices.me](mailto:team@auradigitalservices.me)*