# 💳 Payment System Implementation Guide

## Overview

This guide documents the **production-ready Razorpay payment integration** for booking deposits in NoShowKiller. The system is designed to:

1. **Create real Razorpay orders** (not mocked)
2. **Verify payment signatures** cryptographically
3. **Prevent double-booking without payment**
4. **Handle payment webhooks** for async confirmation
5. **Support refunds** and payment retrieval

---

## 🚀 Setup Steps (4 Simple Steps)

### Step 1: Get Razorpay Credentials

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Navigate to **Settings → API Keys**
3. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
4. Copy your **Key Secret** (keep this secure!)

### Step 2: Configure Environment Variables

In your `.env.local` file (development) or Vercel dashboard (production):

```bash
# Development (test mode)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=rzp_test_YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Production (live mode)
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=rzp_live_YOUR_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> ⚠️ **CRITICAL**: Never commit secrets to Git. Always use environment variables.

### Step 3: Configure Webhook in Razorpay Dashboard

1. Go to **Settings → Webhooks**
2. Click **Add Webhook**
3. Set **URL**: `https://your-app.vercel.app/api/webhooks/razorpay`
4. **Events to listen**: 
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
5. Copy the **Webhook Secret** generated
6. Add it to your env vars as `RAZORPAY_WEBHOOK_SECRET`

### Step 4: Test End-to-End

```bash
# 1. Start development server
npm run dev

# 2. Go to booking page
https://localhost:3000/book

# 3. Complete booking form
# 4. Check box if service requires deposit
# 5. Click "Payment" button
# 6. Use Razorpay test card:
#    Card: 4111 1111 1111 1111
#    Expiry: Any future date
#    CVV: Any 3 digits
```

---

## 🔧 Architecture

### Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER BOOKS APPOINTMENT                                   │
│    - Fills patient details, selects service                 │
│    - Sees deposit amount (if required)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/booking/payment                                │
│    INPUT:  { amount, clinic_id, service_id, ... }          │
│    ACTION: Create Razorpay Order                            │
│    OUTPUT: { order_id, key_id, amount, ... }               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RAZORPAY CHECKOUT MODAL                                  │
│    - User enters card details                               │
│    - Razorpay processes payment                             │
│    - Returns: payment_id, signature                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. POST /api/booking/confirm                                │
│    INPUT:  { payment_id, order_id, razorpay_signature ... }│
│    ACTION: 1. Verify signature                              │
│             2. Fetch payment from Razorpay                  │
│             3. Validate payment status = captured           │
│             4. Create appointment                           │
│    OUTPUT: { appointment_id, success: true }               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ASYNC: RAZORPAY WEBHOOK                                  │
│    EVENT:  payment.captured                                 │
│    ACTION: Optionally update appointment.deposit_status     │
│    (confirm endpoint already validated, so this is backup)  │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### `src/services/payment/index.ts`
- **`createPaymentOrder()`** - Creates Razorpay order with amount, receipt, notes
- **`getPaymentDetails()`** - Fetches payment status from Razorpay
- **`verifyPaymentSignature()`** - Validates signature using HMAC-SHA256
- **`capturePayment()`** - Manually capture authorized (not auto-captured) payments
- **`refundPayment()`** - Process refunds for cancellations
- **`isPaymentSuccessful()`** - Check if payment is `captured` or `authorized`

#### `src/app/api/booking/payment/route.ts`
- Validates amount, clinic, service, patient details
- Calls `createPaymentOrder()` service
- Returns Razorpay checkout details to frontend
- **No** actual charging happens here (Razorpay modal handles it)

#### `src/app/api/booking/confirm/route.ts`
- **CRITICAL ENDPOINT**: Confirms booking only if payment is valid
- Validates payment signature using shared secret
- Fetches payment from Razorpay (don't trust client-side data)
- Checks payment status (`captured` or `authorized`)
- Verifies amount matches (₹X → paise X*100)
- Only then creates appointment

#### `src/app/api/webhooks/razorpay/route.ts`
- Receives async callbacks from Razorpay
- Validates webhook signature
- Handles: `payment.authorized`, `payment.captured`, `payment.failed`
- Optionally updates appointment.deposit_status (backup to confirm endpoint)

---

## 🔐 Security Details

### Signature Verification

**Why**: Prevents attackers from fake payment confirmations

**How**: Razorpay signs every webhook + payment response with HMAC-SHA256

```typescript
// Confirm endpoint validates:
const body = `${orderId}|${paymentId}`
const expectedSig = HMAC-SHA256(body, RAZORPAY_KEY_SECRET)
const verified = expectedSig === clientProvidedSignature
```

### Amount Validation

**Why**: Prevents "checkout for ₹100 but confirm ₹1" attacks

**How**: 
1. Client sends `{ amount: ₹100 }`
2. Server creates order: `{ amount: 10000 }` (paise)
3. User pays
4. Client returns `payment_id`
5. Server fetches payment from Razorpay (not from client!)
6. Server checks: `payment.amount === 10000`

If amounts don't match → **Reject booking**

### Clinic Scoping

**Why**: Prevent Clinic A from using Clinic B's payment

**How**: All payments stored with `clinic_id` in notes + appointment table

```typescript
// Only staff of clinic_id can confirm this appointment
// (enforced by Supabase RLS)
```

---

## 💡 Key Features

### Deposits Per-Service

Define which services require deposits:

```sql
-- In services table
CREATE TABLE services (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  deposit_required BOOLEAN DEFAULT false,  -- ← Controls if payment needed
  deposit_amount DECIMAL DEFAULT 0,        -- ← Amount in ₹
  ...
)
```

If `deposit_required = false` → No payment needed, instant confirm
If `deposit_required = true` → Must pay before appointment confirmed

### Appointment Deposit Tracking

```typescript
// appointments table
{
  id: UUID,
  ...
  deposit_status: 'pending' | 'paid' | 'refunded' | null,
  deposit_payment_id: string,  // ← Links to Razorpay payment_id
  ...
}
```

### Payment Logging

All payments are logged in Supabase via `message_logs` table (extensible):

- Direction: `inbound` (from Razorpay webhook)
- Provider: `razorpay`
- Status: `delivered`, `failed`, etc.
- Error details if failed

---

## 🧪 Testing Checklist

### Test Card Numbers (Razorpay provides)

| Card Number | Expiry | CVV | Result |
|---|---|---|---|
| 4111 1111 1111 1111 | Any Future | Any | ✅ Success |
| 4012 8888 8888 1881 | Any Future | Any | ❌ Failed |
| 5555 5555 5555 4444 | Any Future | Any | ✅ Success |

### Test Scenarios

- [ ] **Happy path**: Book with deposit, pay, confirm → Appointment created
- [ ] **No deposit service**: Book without requiring payment → Instant confirm
- [ ] **Failed payment**: Use failed card, system rejects
- [ ] **Webhook received**: Pay, wait 2-3 seconds, check deposit_status updated
- [ ] **Signature tampering**: Modify order_id in request, rejection
- [ ] **Amount tampering**: Try to confirm for lower amount, rejection
- [ ] **Clinic isolation**: User A pays for clinic A, can't book clinic B

---

## 🚨 Troubleshooting

### "RAZORPAY_KEY_ID is not set"
- Check `.env.local` has correct key
- Restart dev server after adding env vars
- Verify key starts with `rzp_test_` (dev) or `rzp_live_` (prod)

### "Signature verification failed"
- Check `RAZORPAY_KEY_SECRET` matches dashboard
- Verify `RAZORPAY_WEBHOOK_SECRET` is set
- Webhook secret is different from API secret!

### "Payment status is not captured"
- User might not have completed Razorpay form
- Card might have failed silently
- Check Razorpay dashboard for payment status
- Ask user to try again

### Webhook not triggered
- Check webhook URL is publicly accessible (not localhost)
- Verify webhook secret matches dashboard
- Check Razorpay dashboard → Webhooks → Recent Attempts
- Enable webhook test in dashboard to send test events

---

## 📚 Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Card Numbers**: https://razorpay.com/docs/payments/cards/test-card-numbers/
- **Webhooks**: https://razorpay.com/docs/webhooks/
- **Orders API**: https://razorpay.com/docs/api/orders/

---

## 🔗 Related Files

- **Payment Service**: [src/services/payment/index.ts](../../src/services/payment/index.ts)
- **Booking Payment Endpoint**: [src/app/api/booking/payment/route.ts](../../src/app/api/booking/payment/route.ts)
- **Booking Confirm Endpoint**: [src/app/api/booking/confirm/route.ts](../../src/app/api/booking/confirm/route.ts)
- **Razorpay Webhook**: [src/app/api/webhooks/razorpay/route.ts](../../src/app/api/webhooks/razorpay/route.ts)
- **Env Configuration**: [.env.example](.env.example)

---

## 🎯 Next Steps

1. **Get Razorpay credentials** (5 min)
2. **Set env variables** (2 min)
3. **Configure webhook** in Razorpay (3 min)
4. **Test locally** with test cards (10 min)
5. **Deploy to staging** and test
6. **Switch to live credentials** and deploy to production

**Total setup time: ~15 minutes** ⏱️
