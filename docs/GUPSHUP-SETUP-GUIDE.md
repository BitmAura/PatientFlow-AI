# Gupshup WhatsApp Integration Guide

## Overview

Gupshup is our recommended WhatsApp provider for Indian clinics. It provides:
- **Doctor's Number Messaging**: Messages appear to come from the clinic's registered WhatsApp number
- **Verified Channel**: Uses Gupshup's verified infrastructure
- **India-Optimized**: Low latency, high delivery rate for Indian phone numbers
- **Cost-Effective**: Lower per-message rates compared to Meta Cloud API

## Architecture

```
Clinic WhatsApp Setup Flow:
┌─────────────────────────────────┐
│   Clinic Owner Starts Setup      │
│   (Settings > WhatsApp)          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Select Provider: Gupshup       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│  Option A: Auto-Setup (Recommended)             │
│  - We register number on Gupshup for you        │
│  - You enter Gupshup credentials                │
├─────────────────────────────────────────────────┤
│  Option B: Manual Setup                         │
│  - Register on Gupshup yourself                 │
│  - Enter credentials manually                   │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Click "Start Registration"      │
│  (Phone number sent OTP)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Enter OTP from SMS              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  WhatsApp Connection Active!     │
│  (All reminders & automations    │
│   now enabled)                   │
└─────────────────────────────────┘
```

## Setup Instructions

### For Clinic Owners (Self-Service Setup)

#### Step 1: Create Gupshup Account
1. Go to [Gupshup.io](https://www.gupshup.io/)
2. Click "Sign Up" 
3. Register with business email
4. Verify email address
5. Complete business information form

#### Step 2: Access WhatsApp Business API
1. Log in to Gupshup dashboard
2. Navigate to "WhatsApp Business"
3. Click "Add New Business Account"
4. Select your country (India)
5. Provide business details

#### Step 3: Register Your Phone Number
1. In Gupshup dashboard, go to "Phone Numbers"
2. Click "Add Phone Number"
3. Enter your clinic's WhatsApp number (with country code)
   - Format: 919988776655 (not +919988776655)
4. Gupshup will send OTP to that number
5. Enter OTP to verify

#### Step 4: Get Your Credentials
1. Once phone is verified, go to "API & SDK"
2. Find these values:
   - **App ID**: Your Gupshup application ID
   - **API Key** (App Token): Your authentication key
   - **Phone Number ID**: Your registered phone's ID

#### Step 5: Connect in PatientFlow
1. Log in to PatientFlow AI
2. Go to **Settings > WhatsApp Connection**
3. Click **"Connect WhatsApp"**
4. Select **"Gupshup"** as provider
5. Choose **"Manual Setup"** (you have credentials)
6. Enter:
   - App ID
   - API Key
   - Phone Number ID
7. Click **"Test Connection"**
8. If successful, status changes to **"Connected"**
9. Enable automation by clicking **"Activate"**

### For PatientFlow Support Team (Auto-Setup)

If clinic doesn't have Gupshup account:

1. Clinic provides phone number
2. We create Gupshup account on their behalf
3. Register phone number through Gupshup API
4. Store credentials securely in clinic's profile
5. Enable automation automatically

## Environment Variables

Set these in your `.env.local`:

```bash
# Gupshup Setup (Doctor's number → patients)
GUPSHUP_APP_ID=your_app_id_here
GUPSHUP_APP_TOKEN=your_api_key_here
GUPSHUP_API_KEY=your_app_token_here
GUPSHUP_BASE_URL=https://api.gupshup.io/wa/api/v1
GUPSHUP_WEBHOOK_SECRET=your_webhook_secret_here
GUPSHUP_SOURCE_NUMBER=919988776655
```

## How Messages Flow

### 1. Appointment Reminders (24h before)
```
Cron Job (10 AM) 
  → Fetch upcoming appointments
  → Get patient phone from database
  → Send via Gupshup
  → Log message status in reminder_logs
  → Mark appointment.reminder_24h_sent = true
```

### 2. Campaign Messages
```
Clinic Manager triggers campaign
  → Select patients/criteria
  → Draft WhatsApp message
  → Click "Send Campaign"
  → Queue messages to Gupshup
  → Batch send with rate limiting
  → Track delivery in campaign_logs
```

### 3. Lead Follow-ups
```
Lead enters system (from web form, WhatsApp, etc.)
  → Auto-qualification logic
  → If qualified → Send first follow-up
  → Wait 24h → Send second follow-up
  → Track responses in lead_history
```

## API Endpoints Used

### Send Message
```bash
POST https://api.gupshup.io/wa/api/v1/msg
Parameters:
  - channel: "whatsapp"
  - source: "919988776655" (from clinic)
  - destination: "919876543210" (patient)
  - message: {"type": "text", "text": "Your appointment..."}
  - apikey: YOUR_API_KEY
```

### Register Phone
```bash
POST https://partner.gupshup.io/partner/app/{appId}/register
Parameters:
  - phone: "919988776655"
  - verify_method: "otp"
  - apikey: YOUR_API_KEY
```

### Verify OTP
```bash
POST https://partner.gupshup.io/partner/app/{appId}/verify
Parameters:
  - phone: "919988776655"
  - otp: "123456"
  - apikey: YOUR_API_KEY
```

## Webhook Configuration (Optional)

### Setup Webhook
1. In PatientFlow, go to Settings > Webhooks
2. Copy webhook URL: `https://your-domain.com/api/webhooks/gupshup`
3. Log in to Gupshup Dashboard
4. Go to "Settings > Webhooks"
5. Add webhook:
   - URL: `https://your-domain.com/api/webhooks/gupshup`
   - Secret: Use `GUPSHUP_WEBHOOK_SECRET` env var
6. Subscribe to events:
   - `message` (incoming messages)
   - `message_status` (delivery receipts)

### Webhook Events
```json
{
  "type": "message",
  "payload": {
    "sender": {"phone": "919988776655"},
    "type": "text",
    "body": {"text": "Message content"},
    "id": "message_id_123",
    "timestamp": 1234567890
  }
}
```

## Troubleshooting

### "Registration Failed" Error
**Causes:**
- Phone number already registered to another Gupshup account
- Phone number not reachable by SMS OTP
- OTP expired (valid for 10 minutes only)

**Solution:**
1. Verify phone number is correct
2. Check SMS inbox for OTP
3. Ensure network connectivity
4. Try registration again

### "API Key Invalid" Error
**Causes:**
- API key copied incorrectly
- API key is expired
- Environment variable not set

**Solution:**
1. Log in to Gupshup dashboard
2. Go to API & SDK section
3. Regenerate API key if needed
4. Copy exact value (no spaces)
5. Update environment variable

### "Message Send Failed" Error
**Causes:**
- Phone number not verified on Gupshup
- Patient phone number in wrong format
- Rate limit exceeded (20 messages/minute per phone)
- Gupshup API temporarily down

**Solution:**
1. Check phone verification status in Gupshup
2. Verify patient phone numbers are valid
3. Implement retry with exponential backoff (already done ✅)
4. Check Gupshup service status
5. Contact support if persistent

### "Webhook Not Receiving Messages"
**Causes:**
- Webhook URL not accessible
- Webhook secret doesn't match
- IP whitelist issue
- Firewall blocking Gupshup IPs

**Solution:**
1. Verify webhook URL is publicly accessible
2. Check webhook secret in Gupshup matches env var
3. Check server logs for 4xx/5xx errors
4. Whitelist Gupshup's IP addresses
5. Test webhook with simple endpoint first

## Testing

### Test Connection
1. Go to Settings > WhatsApp Connection
2. Enter test phone number (your phone)
3. Click **"Send Test Message"**
4. Check if message arrives

**Test Message:**
```
Hi! This is a test message from PatientFlow AI. 
Your WhatsApp integration is working correctly. ✅
```

### Test with Demo
1. Go to **Public Demo Page**
2. Try "Send WhatsApp Message" simulation
3. Verify message format and content

## Rate Limits

**Per Gupshup Account:**
- Max 200 messages/day from unverified account
- Max 2,000 messages/day from verified account

**Per Recipient Phone:**
- Max 20 messages/minute
- Cooldown period between messages

**Recommendations:**
- Stagger message sending throughout the day
- Use templates for bulk campaigns
- Implement queue with rate limiting (✅ built-in)

## Database Schema

### whatsapp_connections Table
```sql
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  provider TEXT, -- 'gupshup' or 'meta'
  status TEXT, -- 'connected', 'active', 'inactive'
  session_data JSONB, -- {
                       --   "appId": "...",
                       --   "apiKey": "...",
                       --   "phoneNumberId": "...",
                       --   "verified_number": "919988776655"
                       -- }
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  connected_at TIMESTAMP
);
```

### reminder_logs Table
```sql
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID,
  appointment_id UUID,
  phone TEXT,
  message TEXT,
  type TEXT, -- 'appointment_reminder_24h', etc.
  status TEXT, -- 'sent', 'failed', 'pending'
  message_id TEXT, -- Gupshup message ID
  error TEXT,
  retry_count INTEGER, -- 0-3
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Security Considerations

### API Key Protection
- ✅ Never expose API keys in client-side code
- ✅ Always use environment variables
- ✅ Rotate keys periodically
- ✅ Log all API access

### Webhook Verification
- ✅ Verify webhook signature
- ✅ Validate payload source
- ✅ Implement rate limiting
- ✅ Use HTTPS only

### Patient Data Privacy
- ✅ Encrypt stored phone numbers
- ✅ Log minimal PII
- ✅ Implement RLS on reminder_logs
- ✅ GDPR-compliant data retention

## Compliance

### Gupshup Requirements
- ✅ WhatsApp Business Verification
- ✅ Pre-approved message templates
- ✅ Patient opt-in consent
- ✅ Opt-out mechanism

### Indian Regulations
- ✅ DND (Do Not Disturb) compliance
- ✅ DISHA healthcare data security
- ✅ TRAI guidelines for messaging
- ✅ Business registration certificate

## Performance

### Metrics to Monitor
- **Message delivery rate**: Target 98%+
- **Average send time**: <5 seconds per message
- **Error rate**: <2%
- **Retry success rate**: >80%

### Optimization Tips
1. **Batch messages** instead of individual sends
2. **Stagger timing** to avoid rate limits
3. **Use templates** for recurring messages
4. **Monitor logs** for patterns
5. **Implement caching** for clinic data

## Next Steps

1. ✅ **Setup Complete?** Send test message to verify
2. 📱 **Enable Automation** in Settings
3. 📊 **Monitor Logs** in Settings > Message Logs
4. 🎯 **Create Campaigns** in Marketing section
5. 📈 **Track ROI** in Reports > No-Show Recovery

## Support

- **Documentation**: See docs/WHATSAPP-TROUBLESHOOTING.md
- **Knowledge Base**: support.patientflow.ai
- **Email Support**: support@patientflow.ai
- **Live Chat**: Available in-app during business hours
- **Emergency**: +91-XXXX-XXXX-XXX (24/7)

---

**Version**: 1.0  
**Last Updated**: April 8, 2026  
**Status**: Production Ready ✅