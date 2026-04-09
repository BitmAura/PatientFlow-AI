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
- **No-Show Risk Engine (NEW)** — AI-driven 0-100 risk scoring integrated into all schedule views with color-coded badges
- **Patients** — Full patient record management, lifecycle tracking, opt-in/opt-out
- **Leads** — Kanban-style CRM pipeline (New → Contacted → Responsive → Booked → Lost)
- **Money Leak List (NEW)** — Priority panel identifying overdue recalls ranked by treatment-tier revenue
- **Reminders** — Configure 24h and 2h WhatsApp, SMS, email reminders
- **Recalls** — View, manage, and manually trigger patient recall campaigns
- **Follow-ups** — Structured follow-up scheduling for leads and patients
- **Campaigns** — Broadcast WhatsApp campaign management
- **Journeys** — Visual patient journey template builder (N-step automated sequences)
- **Inbox** — Incoming WhatsApp message inbox from patients
- **Waiting List** — Smart waiting list with auto-fill for cancellations
- **CSV Data Hub (NEW)** — Patient bulk import engine with strict 10-digit Indian phone validation and deduplication
- **Services** — Clinic service/treatment catalog with pricing
- **Reports** — Staff performance view, ROI report, founder brief
- **Settings** — WhatsApp connection, business hours, clinic profile, notification preferences

### ✅ Owner / Founder Layer
- **Morning Intelligence Brief (NEW)** — Daily automated summary: new leads, recovered revenue, and high-risk appointment alerts
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

#### Risk Engine Service (NEW) (`src/services/risk-service.ts`)
- Hardened no-show risk calculation (0-100)
- Uses historical patterns, lead time, and confirmation status
- Live updates to dashboard appointment lists

#### WhatsApp Service (`src/services/whatsapp-service.ts`)
- Multi-Tenant Routing: Single number **Shared Agency Mode** or **Private Clinic Mode**
- Gupshup integration (primary provider)
- Message queuing and retry logic
- Webhook handler for inbound messages, opt-outs, and auto-waitlist fill

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

### Engine 2: The No-Show Risk Engine (NEW)
**Mission**: Predict and prevent cancellations before they happen.

```
Appointment Created
       ↓
Algorithm evaluates Risk Score (0-100)
       ↓
T-24h: "Reminder + Confirm?" WhatsApp (interactive buttons)
       ↓
Patient Replies: CONFIRM / RESCHEDULE / CANCEL
       ↓
If CANCEL → Automatically fill from Waiting List
       ↓
If High Risk → Staff notification for personal call nudge
```

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
3 Failures → Staff "Money Leak List"
```

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

---

## API & Cron Jobs

### Cron Schedule (vercel.json)

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/morning-brief` | 8 AM daily | Owner Intelligence Brief |
| `/api/cron/recalls` | 9 AM daily | Recall batch processing |
| `/api/cron/send-reminders` | 10 AM daily | Appointment reminders |
| `/api/cron/google-reviews` | 2 PM daily | Google Review nudges |

---

## Pricing & Billing

| Plan | Monthly | Annual | Appointments | WhatsApp | Doctors |
|---|---|---|---|---|---|
| **Starter** | ₹2,999 | ₹28,790 | 500/mo | 500/mo | 3 |
| **Growth** | ₹8,999 | ₹86,390 | 2,000/mo | 2,000/mo | 10 |
| **Pro** | ₹14,999 | ₹1,43,990 | Unlimited | Unlimited | Unlimited |

---

## WhatsApp Integration

We use **Gupshup** as our primary WhatsApp Business API provider.

### Setup Modes
1. **Shared Agency Mode**: Use our verification for instant launch.
2. **Private Clinic Mode**: Use your own Gupshup APP_ID and Source Number.

---

## Security & Compliance
- **RLS** on all 20+ tables.
- **DISHA Compliant** healthcare data handling.
- **Global OPT-OUT** via `STOP` command.
- **9 AM – 7 PM IST** messaging window enforcement.

---

## Roadmap

### ✅ Completed
- [x] **No-Show Risk Engine (AI)**
- [x] **Morning Intelligence Briefs**
- [x] **Automated Google Reviews**
- [x] **CSV Bulk Import & Deduplication**
- [x] **Interactive WhatsApp Buttons**
- [x] **Shared Number Infrastructure**

### 🏗️ Coming Next (Phase 2)
- [ ] **G-Calendar Two-Way Sync**
- [ ] **Staff Mobile PWA**
- [ ] **Razorpay Deposit links**

---

## License
Copyright © 2026 Aura Digital Services. All rights reserved.