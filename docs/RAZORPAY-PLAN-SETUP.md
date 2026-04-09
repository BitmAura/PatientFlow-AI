# Razorpay Plan Configuration Guide

## 🔴 Current Issue: Payment Upgrade Failing

**Error Message:** `Razorpay plan ID not configured for {plan} {billingCycle}`

This means the required Razorpay Plan IDs are missing from your environment variables.

---

## 📋 Required Environment Variables

You need to configure **6 Plan IDs** from your Razorpay Dashboard:

```env
# Monthly Plans
RAZORPAY_PLAN_STARTER_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_GROWTH_MONTHLY=plan_xxxxx
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxxx

# Annual Plans
RAZORPAY_PLAN_STARTER_ANNUAL=plan_xxxxx
RAZORPAY_PLAN_GROWTH_ANNUAL=plan_xxxxx
RAZORPAY_PLAN_PRO_ANNUAL=plan_xxxxx
```

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Razorpay Credentials

1. Log into [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Copy your **Key ID** and **Key Secret**
4. Ensure these are in your `.env.local`:
   ```env
   RAZORPAY_KEY_ID=rzp_xxxxx
   RAZORPAY_KEY_SECRET=xxx
   ```

### Step 2: Create Subscription Plans in Razorpay

You need to create **6 subscription plans** (3 for monthly, 3 for annual).

**Plan Details:**

#### Starter Plan
| Cycle | Price (₹) | Plan Name | Billing |
|-------|-----------|-----------|---------|
| Monthly | 999 | Starter Monthly | Every month |
| Annual | 9999 | Starter Annual | Every year |

#### Growth Plan
| Cycle | Price (₹) | Plan Name | Billing |
|-------|-----------|-----------|---------|
| Monthly | 2999 | Growth Monthly | Every month |
| Annual | 29999 | Growth Annual | Every year |

#### Pro Plan
| Cycle | Price (₹) | Plan Name | Billing |
|-------|-----------|-----------|---------|
| Monthly | 4999 | Pro Monthly | Every month |
| Annual | 49999 | Pro Annual | Every year |

**To Create a Plan in Razorpay:**

1. Go to **Products → Subscriptions** in Razorpay Dashboard
2. Click **Create Plan**
3. Enter Plan Details:
   - **Plan Interval:** 1
   - **Plan Period:** MONTHLY or YEARLY
   - **Plan Name:** (Use names from table above)
   - **Plan Price:** (From table above)
   - **Description:** (Optional)

4. Click **Create Plan**
5. Copy the **Plan ID** (format: `plan_xxxxx`)

### Step 3: Add Plan IDs to Environment

After creating all 6 plans, add them to your `.env.local`:

```env
# Monthly Plans
RAZORPAY_PLAN_STARTER_MONTHLY=plan_ABC123XYZ
RAZORPAY_PLAN_GROWTH_MONTHLY=plan_DEF456UVW
RAZORPAY_PLAN_PRO_MONTHLY=plan_GHI789RST

# Annual Plans
RAZORPAY_PLAN_STARTER_ANNUAL=plan_JKL012PQR
RAZORPAY_PLAN_GROWTH_ANNUAL=plan_MNO345NOP
RAZORPAY_PLAN_PRO_ANNUAL=plan_PQR678MNO
```

### Step 4: Verify Configuration

1. Restart your dev server: `npm run dev`
2. Go to Billing → Upgrade Plan
3. Try upgrading a plan
4. You should now see the Razorpay payment form instead of the error

---

## 🧪 Testing Payment Flow

### Local Testing (Sandbox Mode)

Razorpay Test Credentials:
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
OTP: Any 6 digits
```

### Verifying Plans Were Created Correctly

1. In Razorpay Dashboard → **Products → Subscriptions**
2. You should see all 6 plans listed
3. Each plan should show:
   - Plan ID (plan_xxxxx)
   - Cycle (MONTHLY or YEARLY)
   - Price
   - Status (Active)

---

## 🔧 Troubleshooting

### Issue: "Razorpay plan ID not configured"

**Solution:** Check your `.env.local` file:
- Verify all 6 environment variables are set
- Ensure Plan IDs are spelled correctly (they start with `plan_`)
- Restart your dev server after adding new env vars

### Issue: "Customer is already on this plan"

**This is expected** - Razorpay prevents downgrading. The error is actually correct behavior. The UI should handle this gracefully.

### Issue: "Invalid plan ID"

**Solution:** Verify the plan exists in Razorpay Dashboard:
1. Go to Products → Subscriptions
2. Search for the plan ID
3. If not found, create a new plan and update `.env.local`

### Issue: Payment page shows but doesn't process

**Possible causes:**
- Razorpay webhook not configured (see WebhookSetup)
- JSON parsing issue in response
- CORS issue (check browser console)

---

## 🔗 Webhook Configuration (Important!)

For production, you need to configure Razorpay Webhooks:

1. Go to **Razorpay Dashboard → Settings → Webhooks**
2. Click **Add New Webhook**
3. Configure:
   - **Webhook URL:** `https://yourdomain.com/api/webhooks/razorpay`
   - **Events:** Select:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.charged`
     - `subscription.paused`
     - `subscription.cancelled`

3. Click **Create**

---

## 📊 Related Code Files

These files handle the payment flow:

- **API Endpoint:** [src/app/api/subscription/upgrade/route.ts](../src/app/api/subscription/upgrade/route.ts)
- **Razorpay Service:** [src/lib/razorpay/subscriptions.ts](../src/lib/razorpay/subscriptions.ts)
- **UI Component:** [src/components/billing/plan-comparison.tsx](../src/components/billing/plan-comparison.tsx)
- **Frontend Hook:** [src/hooks/use-subscription.ts](../src/hooks/use-subscription.ts)
- **Webhook Handler:** [src/app/api/webhooks/razorpay/route.ts](../src/app/api/webhooks/razorpay/route.ts)

---

## ✅ Checklist for Production

- [ ] All 6 Plan IDs created in Razorpay
- [ ] All 6 environment variables configured
- [ ] Razorpay key pair (Key ID + Secret) set in `.env`
- [ ] Dev server restarted after adding env vars
- [ ] Upgrade flow tested with test card
- [ ] Webhooks configured for production domain
- [ ] Error messages display correctly in upgrade dialog
- [ ] Deployment to production with updated `.env`

---

## 📞 Support

If you encounter issues:

1. **Check error message in upgrade dialog** - It now shows the specific error
2. **Check browser console** - DevTools might show additional details
3. **Verify Razorpay dashboard** - Ensure plans are active
4. **Check `.env.local`** - Verify all variables are set correctly

---

## 🔗 Useful Links

- [Razorpay Subscriptions Docs](https://razorpay.com/docs/subscriptions/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-cards/)
- [Razorpay API Keys](https://dashboard.razorpay.com/app/settings/api-keys)
- [Razorpay Webhooks](https://dashboard.razorpay.com/app/webhooks)
