# Setup Guide

This guide covers the complete setup process for the NoShowKiller platform, including third-party integrations and deployment.

## 1. Supabase Setup

The backend is powered by Supabase. You'll need a new project.

1. **Create Project**: Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. **Database Password**: Save your database password; you'll need it for the connection string.
3. **API Keys**: Go to Project Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this safe!)

### Database Migrations

We use Supabase CLI for database management.

1. **Login to CLI**:
   ```bash
   npx supabase login
   ```
2. **Link Project**:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
3. **Push Schema**:
   ```bash
   npx supabase db push
   ```

This will create all tables, enums, RLS policies, and triggers defined in `supabase/migrations`.

### Auth Configuration

1. Go to Authentication > Providers in Supabase.
2. Enable **Email** provider.
3. (Optional) Configure Google/GitHub auth if needed.
4. Go to Authentication > URL Configuration:
   - Set **Site URL** to your app root (e.g. `https://app.patientflow.ai` for prod, `http://localhost:3000` for dev).
   - Add **Redirect URLs**: `http://localhost:3000/api/auth/callback` and `https://your-domain.com/api/auth/callback` (use your real production domain). If these are missing, login can fail with "Failed to fetch".

## 2. WhatsApp Integration

Messages are sent **from the doctor’s number** to leads and patients. We support **Gupshup** (recommended) and Meta Cloud API.

### Option A: Gupshup (doctor’s number → leads/patients)

1. **Gupshup account**: Sign up at [Gupshup](https://www.gupshup.io/) and create an app.
2. **Env vars**: Set `GUPSHUP_APP_ID`, `GUPSHUP_APP_TOKEN` (or `GUPSHUP_API_KEY`). Optional: `GUPSHUP_BASE_URL`, `GUPSHUP_WEBHOOK_SECRET`.
3. **Connect in app**: Dashboard → Settings → WhatsApp → enter the **doctor’s phone** (E.164, e.g. +919876543210) → receive OTP → verify. That number becomes the “from” for all messages.
4. **Webhook**: In Gupshup set callback URL to `https://your-domain.com/api/webhooks/gupshup`. If you set `GUPSHUP_WEBHOOK_SECRET`, the webhook verifies `Authorization: Bearer <secret>` or `x-gupshup-token`.

### Option B: Meta Cloud API

1. **Meta Developer Account**: Create an app in [Meta Developers](https://developers.facebook.com/).
2. **WhatsApp Product**: Add WhatsApp, add phone number, generate access token.
3. **Env fallbacks**: `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_URL` (optional).
4. **Webhook**: URL `https://your-domain.com/api/webhooks/whatsapp`, verify token in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, subscribe to `messages`.

## 3. Razorpay Setup

For collecting deposits.

1. Create account on [Razorpay](https://razorpay.com/).
2. Go to Settings > API Keys and generate Key ID and Key Secret.
3. Go to Settings > Webhooks:
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Secret: Set a secret and add to `RAZORPAY_WEBHOOK_SECRET`.
   - Events: `order.paid`, `payment.captured`, `payment.failed`.

## 4. Vercel Deployment

1. **Import Project**: Connect your GitHub repo to Vercel.
2. **Environment Variables**: Copy all variables from `.env.local` to Vercel Environment Variables.
3. **Build Settings**: Default Next.js settings work fine.
4. **Deploy**: Click Deploy.

## 5. Cron Jobs

We use Vercel Cron or GitHub Actions for scheduled tasks (reminders).

**Vercel Cron (Recommended):**
The `vercel.json` file is configured with:
- `api/cron/send-reminders`: Daily at 10:00 (reminders).
- `api/cron/process-campaigns`: Daily at 11:00.
- `api/cron/leads`: Daily at 09:00 (lead follow-ups).
- `api/cron/recalls`: Daily at 08:00 (recall messages).

Set `CRON_SECRET` in Vercel and use the same value when triggering crons (e.g. `Authorization: Bearer <CRON_SECRET>`).

## 6. Domain Configuration

1. Add your custom domain in Vercel.
2. Update `NEXT_PUBLIC_APP_URL` in environment variables.
3. Update Supabase Auth Site URL.
4. Update Razorpay/WhatsApp webhook URLs.

## 7. Environment variables (reference)

Copy from `.env.example`. Required for core flows:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth and DB (client). |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron, onboarding, webhooks (server-only). |
| `NEXT_PUBLIC_APP_URL` | Base URL (e.g. booking links in lead messages). |
| `CRON_SECRET` | Protects cron endpoints. |
| `GUPSHUP_APP_ID`, `GUPSHUP_APP_TOKEN` (or `GUPSHUP_API_KEY`) | Gupshup send + register/verify. |
| `GUPSHUP_WEBHOOK_SECRET` | Optional webhook verification. |
| `RAZORPAY_*`, `WHATSAPP_*` | Billing and Meta WhatsApp (if used). |

## 8. Troubleshooting

- **Supabase Connection**: Check if your IP is allowed in Supabase Database settings if running locally.
- **Webhook Failures**: Check Vercel logs for function timeouts or 500 errors.
- **Email Issues**: Verify Resend domain if emails land in spam.
