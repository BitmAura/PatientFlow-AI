# Gupshup WhatsApp Integration Guide

## Overview

Gupshup is our recommended WhatsApp provider for Indian clinics. It provides:
- **Doctor's Number Messaging**: Messages appear to come from the clinic's registered WhatsApp number
- **Verified Channel**: Uses Gupshup's verified infrastructure
- **India-Optimized**: Low latency, high delivery rate for Indian phone numbers
- **Cost-Effective**: Lower per-message rates compared to Meta Cloud API

## Architecture

```
Clinic WhatsApp Setup Flow (Fully Automated):
┌─────────────────────────────────────────────┐
│   Clinic Owner: Go to Settings > WhatsApp   │
│   Click "Connect WhatsApp"                  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  PatientFlow Setup Wizard Appears            │
│  "Enter your clinic's WhatsApp number"      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  We Create Gupshup Account + Register       │
│  (All backend, you don't see credentials)   │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  OTP Sent to Your Phone via SMS             │
│  (You just verify - no credentials needed)  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Enter OTP Code (6 digits)                  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  ✅ WhatsApp Active!                        │
│  (All reminders, campaigns, automations     │
│   start working immediately)                │
└─────────────────────────────────────────────┘
```

## Setup Instructions (Simple 2-Step Process)

### Step 1: Open Setup Wizard
1. Log in to PatientFlow AI
2. Go to **Settings > WhatsApp Connection**
3. Click **"Connect WhatsApp"**
4. Setup wizard opens automatically

### Step 2: Enter Phone Number & Verify OTP
1. **You enter**: Your clinic's WhatsApp number
   - Example: 919988776655 (just the digits)
2. **We do**: Automatically create Gupshup account + register number
3. **You receive**: OTP via SMS to that phone
4. **You enter**: The 6-digit OTP code
5. **Done!** WhatsApp connection is live

### That's It!

No need to:
- ❌ Create Gupshup account manually
- ❌ Deal with API keys or credentials
- ❌ Navigate Gupshup dashboard
- ❌ Copy-paste complex values

We handle everything automatically. You just:
1. Provide phone number
2. Verify OTP
3. Start sending reminders ✅

## Environment Variables (Server-Only)

These are managed automatically. For developers only:

```bash
# Gupshup Base Configuration
GUPSHUP_BASE_URL=https://api.gupshup.io/wa/api/v1

# Webhook Configuration (Optional)
GUPSHUP_WEBHOOK_SECRET=generated_during_setup
```

**Note**: API Keys and credentials are stored securely in the database per clinic. Clinic owners don't need to handle them.

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

## Credentials Storage (Automatic)

When you complete setup:
- ✅ Gupshup credentials stored securely in database
- ✅ Encrypted at rest
- ✅ Per-clinic isolation
- ✅ Never exposed to client-side code
- ✅ Admin can't view raw credentials (by design)

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
- Phone number not reachable by SMS
- OTP expired (valid for 10 minutes only)
- Network connectivity issue

**Solution:**
1. Verify phone number is correct
2. Give it 2-3 minutes for SMS to arrive
3. Check SMS inbox (may come from shortcode)
4. Ensure phone has signal and SMS enabled
5. Try setup again

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

## After Setup: What Happens Automatically

1. ✅ **Appointment Reminders** - Sent 24h before each appointment
2. ✅ **Lead Follow-ups** - Auto-sent based on lead status
3. ✅ **Recall Notifications** - For recurring treatments
4. ✅ **Campaigns** - You can create manual WhatsApp campaigns
5. ✅ **Message Logs** - All messages tracked in Settings > Message Logs
6. ✅ **Delivery Reports** - See which messages were delivered/read

**View Status Anytime**: Settings > WhatsApp Connection (shows green "✅ Connected")

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