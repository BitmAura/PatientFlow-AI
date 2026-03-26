# Razorpay Subscription Setup Guide

## Summary

Core subscription infrastructure is now built. Here's what's ready and what you need to configure.

## ✅ What's Built

### 1. Database Schema (`supabase/migrations/20260206_add_subscriptions.sql`)

- **subscriptions** table - Tracks user plans, trial periods, Razorpay IDs
- **subscription_usage** table - Monitors appointments, messages sent per period
- **payments** table - Full payment history
- Auto-creates trial subscription on signup
- RLS policies for security
- Helper functions: `has_active_subscription()`, `get_subscription_limits()`

### 2. Razorpay Integration (`src/lib/razorpay/subscriptions.ts`)

- Create/cancel/update subscriptions
- Customer management
- Webhook signature verification
- Plan configuration (Clinic: ₹2,999, Hospital: ₹9,999)

### 3. API Endpoints

- `POST /api/subscriptions/create` - Convert trial to paid subscription
- `POST /api/subscriptions/webhook` - Handle Razorpay events

---

## 🔧 Required Setup (30 minutes)

### Step 1: Run Database Migration

```bash
cd no-show-killer
# Apply migration to your Supabase project
npx supabase db push
```

This creates all subscription tables and functions.

### Step 2: Create Razorpay Plans

You need to create subscription plans in Razorpay dashboard **once**:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Subscriptions** → **Plans**
3. Click **Create Plan**

Create these 4 plans:

#### Clinic Monthly

- Name: `NoShowKiller Clinic - Monthly`
- Billing Period: `Monthly`
- Billing Interval: `1`
- Amount: `₹2,999.00`
- Copy the Plan ID (e.g., `plan_xxxxxxxxxxxxx`)

#### Clinic Annual

- Name: `NoShowKiller Clinic - Annual`
- Billing Period: `Yearly`
- Billing Interval: `1`
- Amount: `₹28,792.80` (20% discount)
- Copy the Plan ID

#### Hospital Monthly

- Name: `NoShowKiller Hospital - Monthly`
- Billing Period: `Monthly`
- Billing Interval: `1`
- Amount: `₹9,999.00`
- Copy the Plan ID

#### Hospital Annual

- Name: `NoShowKiller Hospital - Annual`
- Billing Period: `Yearly`
- Billing Interval: `1`
- Amount: `₹95,990.40` (20% discount)
- Copy the Plan ID

### Step 3: Configure Environment Variables

Add to `.env.local`:

```env
# Razorpay Credentials (from Razorpay dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Razorpay Subscription Plan IDs (from Step 2)
RAZORPAY_PLAN_CLINIC_MONTHLY=plan_xxxxxxxxxxxxx
RAZORPAY_PLAN_CLINIC_ANNUAL=plan_xxxxxxxxxxxxx
RAZORPAY_PLAN_HOSPITAL_MONTHLY=plan_xxxxxxxxxxxxx
RAZORPAY_PLAN_HOSPITAL_ANNUAL=plan_xxxxxxxxxxxxx

# Webhook Secret (Razorpay Dashboard → Webhooks → Secret)
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### Step 4: Set Up Webhooks

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Enter Webhook URL:
   ```
   https://your-app.vercel.app/api/subscriptions/webhook
   ```
4. Select these events:
   - ✅ `subscription.activated`
   - ✅ `subscription.charged`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.paused`
   - ✅ `subscription.halted`
   - ✅ `subscription.completed`
   - ✅ `payment.failed`

5. Copy the **Webhook Secret** and add to `.env.local`

---

## 📋 User Flow (How It Works)

### Trial Period (Days 1-14)

```
1. User signs up → Auto-creates trial subscription in database
2. Status: 'trialing'
3. Trial ends: NOW() + 14 days
4. Full access to all features
```

### Converting to Paid (Day 14)

```
1. User prompted to enter payment details
2. Frontend calls: POST /api/subscriptions/create
3. Creates Razorpay subscription
4. User redirected to Razorpay payment page
5. Payment successful → Webhook: subscription.activated
6. Status changes: 'trialing' → 'active'
```

### Monthly Billing

```
1. Razorpay auto-charges on billing date
2. Webhook: subscription.charged
3. Payment recorded in payments table
4. User continues with active subscription
```

### Cancellation

```
1. User clicks "Cancel Subscription"
2. Subscription cancelled at period end
3. Webhook: subscription.cancelled
4. Status: 'cancelled'
5. Access continues until period end
```

---

## 🧪 Testing

### Test Subscription Creation

```bash
curl -X POST https://your-app.vercel.app/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "planId": "clinic",
    "billingCycle": "monthly"
  }'
```

### Test Razorpay Cards

Use these test cards in Razorpay test mode:

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Webhooks Locally

```bash
# Install Razorpay webhook CLI
npm install -g razorpay-webhook-cli

# Forward webhooks to localhost
razorpay webhooks forward --port 3000 --path /api/subscriptions/webhook
```

---

## 🚀 Next Steps

1. **Run migration** - Apply database schema
2. **Create Razorpay plans** - One-time setup
3. **Configure env vars** - Add plan IDs
4. **Set up webhooks** - Configure in Razorpay
5. **Build billing UI** - Create payment modal in dashboard
6. **Test end-to-end** - Sign up → Trial → Convert to paid

---

## 💡 What's Still Needed

### Frontend (Week 2)

- Billing page in dashboard (`/dashboard/billing`)
- Payment modal for trial conversion
- Subscription status indicator
- Usage meter (appointments used vs limit)
- Upgrade/downgrade flow

### Email Notifications

- Trial ending soon (days 11, 13)
- Payment successful
- Payment failed
- Subscription cancelled

### Admin Dashboard

- View all subscriptions
- Revenue analytics
- Churn tracking

---

**Status**: Backend infrastructure complete ✅  
**Ready for**: Frontend billing UI development  
**Estimated time to first payment**: 2-3 days (after UI is built)
