# No Show Killer

No Show Killer is a clinic operations platform that helps healthcare teams reduce missed appointments using automation, reminders, recall workflows, and conversion-focused lead follow-ups.

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
