# Gupshup API Integration Reference

## Table of Contents
1. [Sending Messages](#sending-messages)
2. [Registering & Verifying Numbers](#registering--verifying-numbers)
3. [Receiving Messages](#receiving-messages)
4. [Webhook Configuration](#webhook-configuration)
5. [Error Handling](#error-handling)
6. [Rate Limits & Quotas](#rate-limits--quotas)
7. [Database Schema](#database-schema)
8. [Examples](#examples)

---

## Sending Messages

### Using PatientFlow Service (Recommended)

```typescript
import { sendGupshupMessage } from '@/lib/gupshup/service'

const result = await sendGupshupMessage({
  clinicId: 'clinic_123',
  phoneNumberId: '919988776655',
  apiKey: 'your_api_key',
  destination: '919876543210',
  messageText: 'Your appointment is tomorrow at 2 PM',
  appName: 'AuraRecall', // Optional, default shown
})

if (result.success) {
  console.log(`Message sent: ${result.messageId}`)
} else {
  console.log(`Failed: ${result.error}`)
}
```

### Raw Gupshup API

**Endpoint:** `POST https://api.gupshup.io/wa/api/v1/msg`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | Yes | Always `"whatsapp"` |
| `source` | string | Yes | Your phone number (digits only) |
| `destination` | string | Yes | Recipient phone (digits only) |
| `src.name` | string | Yes | Your clinic name |
| `message` | JSON | Yes | Message content (see below) |
| `apikey` | string | Yes | Your API key |

**Message JSON:**
```json
{
  "type": "text",
  "text": "Your appointment reminder",
  "previewUrl": false
}
```

**Response:**
```json
{
  "status": "submitted",
  "messageId": "gsmsg_abc123xyz",
  "timestamp": 1234567890
}
```

**cURL Example:**
```bash
curl -X POST https://api.gupshup.io/wa/api/v1/msg \
  -d "channel=whatsapp" \
  -d "source=919988776655" \
  -d "destination=919876543210" \
  -d "src.name=MyClinic" \
  -d 'message={"type":"text","text":"Hello!","previewUrl":false}' \
  -d "apikey=YOUR_API_KEY"
```

---

## Registering & Verifying Numbers

### Step 1: Register Phone (Get OTP)

**Endpoint:** `POST https://partner.gupshup.io/partner/app/{appId}/register`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Phone number (digits only, e.g., `919988776655`) |
| `verify_method` | string | Yes | Always `"otp"` |
| `apikey` | string | Yes | Your API key |

**Response:**
```json
{
  "status": "success",
  "request_id": "req_abc123",
  "message": "OTP sent to your phone"
}
```

**Service Method:**
```typescript
import { registerPhoneWithGupshup } from '@/lib/gupshup/service'

const result = await registerPhoneWithGupshup({
  clinicId: 'clinic_123',
  phoneNumber: '+919988776655',
  appId: 'your_app_id',
  apiKey: 'your_api_key',
})

if (result.success) {
  // Save request_id, user will receive OTP
  console.log(`Registration initiated: ${result.requestId}`)
}
```

### Step 2: Verify OTP

**Endpoint:** `POST https://partner.gupshup.io/partner/app/{appId}/verify`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Same phone from registration |
| `otp` | string | Yes | 6-digit OTP received |
| `apikey` | string | Yes | Your API key |

**Response:**
```json
{
  "status": "success",
  "number_id": "919988776655",
  "message": "Phone verified successfully"
}
```

**Service Method:**
```typescript
import { verifyPhoneOtpGupshup } from '@/lib/gupshup/service'

const result = await verifyPhoneOtpGupshup({
  clinicId: 'clinic_123',
  phoneNumber: '919988776655',
  otp: '123456',
  appId: 'your_app_id',
  apiKey: 'your_api_key',
})

if (result.success) {
  console.log(`Phone verified: ${result.numberId}`)
  // Save number_id for future messaging
}
```

---

## Receiving Messages

### Webhook Payload

**Gupshup sends incoming messages via POST to your webhook URL:**

**Message from patient:**
```json
{
  "type": "message",
  "timestamp": 1234567890,
  "payload": {
    "id": "gsmsg_abc123",
    "source": "919876543210",
    "sender": {
      "phone": "919876543210",
      "name": "John Doe"
    },
    "body": {
      "type": "text",
      "text": "Yes, I have an appointment tomorrow"
    }
  }
}
```

**Message/Status update:**
```json
{
  "type": "message_status",
  "timestamp": 1234567890,
  "payload": {
    "id": "gsmsg_abc123",
    "status": "delivered", // 'failed', 'read' also possible
    "timestamp": 1234567890
  }
}
```

### Parsing in Code

```typescript
import { parseGupshupWebhook } from '@/lib/gupshup/service'

export async function POST(req: Request) {
  const payload = await req.json()
  
  const parsed = parseGupshupWebhook(payload)
  
  if (parsed.type === 'message') {
    console.log(`Message from ${parsed.data.from}: ${parsed.data.text}`)
    // Handle incoming message (auto-reply, log, etc.)
  }
  
  if (parsed.type === 'status') {
    console.log(`Message ${parsed.data.messageId} is ${parsed.data.status}`)
    // Update message status in database
  }
  
  return Response.json({ success: true })
}
```

---

## Webhook Configuration

### Register Webhook in Gupshup

1. Log in to Gupshup Dashboard
2. Go to **Settings > Webhooks**
3. Click **Add Webhook**
4. Fill in:
   - **Webhook URL**: `https://your-domain.com/api/webhooks/gupshup`
   - **Webhook Secret**: Generate or use existing (for signature verification)
5. Select events: `message_received`, `message_status`
6. Click **Save**

### Verify Webhook Signature

```typescript
import { verifyGupshupWebhookSignature, parseGupshupWebhook } from '@/lib/gupshup/service'

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get('X-Gupshup-Signature')
  const secret = process.env.GUPSHUP_WEBHOOK_SECRET || ''
  
  // Verify authenticity
  if (!verifyGupshupWebhookSignature(payload, signature, secret)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Now parse and process
  const data = JSON.parse(payload)
  const parsed = parseGupshupWebhook(data)
  
  // ... handle parsed message ...
  
  return Response.json({ success: true })
}
```

### Webhook URL (Next.js API Route)

**File:** `src/app/api/webhooks/gupshup/route.ts`

```typescript
/**
 * Gupshup webhook handler
 * Receives incoming messages and delivery status updates
 */

import { verifyGupshupWebhookSignature, parseGupshupWebhook } from '@/lib/gupshup/service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('X-Gupshup-Signature')
    const secret = process.env.GUPSHUP_WEBHOOK_SECRET

    // Verify signature
    if (secret && !verifyGupshupWebhookSignature(payload, signature, secret)) {
      console.warn('[Webhook] Invalid signature, rejecting')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadObj = JSON.parse(payload)
    const parsed = parseGupshupWebhook(payloadObj)

    console.log('[Webhook] Received event:', parsed.type)

    if (parsed.type === 'message') {
      // Handle incoming patient message
      await supabase.from('patient_messages').insert({
        phone_number: parsed.data.from,
        message_text: parsed.data.text,
        provider: 'gupshup',
        provider_message_id: parsed.data.messageId,
        received_at: new Date(parsed.data.timestamp * 1000),
      })

      console.log('[Webhook] Message stored')
    }

    if (parsed.type === 'status') {
      // Update message delivery status
      await supabase
        .from('reminder_logs')
        .update({
          provider_status: parsed.data.status,
          delivered_at: parsed.data.status === 'delivered' ? new Date() : null,
          updated_at: new Date(),
        })
        .eq('provider_message_id', parsed.data.messageId)

      console.log('[Webhook] Status updated')
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    // Always return 200 to Gupshup to avoid retries
    return Response.json({ error: 'Processing error' }, { status: 200 })
  }
}
```

---

## Error Handling

### Error Codes

| Code | Status | Cause | Solution |
|------|--------|-------|----------|
| 1001 | API Request Error | Malformed request | Check request format |
| 1002 | API Auth Error | Invalid credentials | Verify API key |
| 1003 | Insufficient Balance | Quota exceeded | Check subscription |
| 1004 | Invalid Destination | Bad phone number | Format as digits only |
| 1005 | Invalid Source | Wrong sender ID | Verify registered number |
| 1100 | Channel Limit Exceeded | Rate limited | Implement backoff |
| 1101 | Request Timeout | Network issue | Retry with backoff |
| 429 | Too Many Requests | Rate limited | Same as 1100 |

### Handling Errors in Code

```typescript
import { sendGupshupMessage } from '@/lib/gupshup/service'

const result = await sendGupshupMessage(params)

if (!result.success) {
  if (result.error?.includes('Balance')) {
    // Handle quota issue
    console.error('Gupshup quota exceeded')
    // Notify admin, switch provider
  }
  
  if (result.error?.includes('Destination')) {
    // Handle invalid number
    console.error('Invalid phone number format')
    // Log invalid number, skip
  }
  
  if (result.error?.includes('timeout')) {
    // Network issue - will auto-retry
    console.error('Network timeout, will retry')
  }
}
```

### Retry Strategy (Automatic)

The `sendGupshupMessage` function automatically retries with exponential backoff:

```
Attempt 1: Immediate
  ↓ (if fails)
Attempt 2: Wait 2 seconds
  ↓ (if fails)
Attempt 3: Wait 4 seconds
  ↓ (if fails)
Max retries (3) exceeded, mark as failed
```

Retryable errors:
- Network timeouts
- 429 Rate Limit
- 503 Service Unavailable
- Connection refused

Non-retryable errors:
- Invalid credentials (401)
- Invalid phone number (1004)
- Insufficient quota (1003)

---

## Rate Limits & Quotas

### Per-Minute Limits

```
Unverified Account:
- 20 messages/minute (to different recipients)
- 1 message/minute (to same recipient)

Verified Account:
- 200+ messages/minute (depending on tier)
- No single-recipient limit
```

### Daily Limits

```
Unverified: 200 messages/day
Bronze: 1000 messages/day
Silver: 5000 messages/day
Gold: 10000+ messages/day
```

### How to Increase Quota

1. Verify your phone number (done automatically)
2. Complete business information in Gupshup dashboard
3. Contact Gupshup sales for higher limits: https://gupshup.io/pricing

### Monitoring Quota Usage

```typescript
// Check current usage
const data = await fetch('https://api.gupshup.io/wa/api/v1/stats', {
  method: 'POST',
  body: new URLSearchParams({
    apikey: API_KEY,
  }),
})

const stats = await data.json()
console.log(`Remaining quota: ${stats.remaining}`)
```

---

## Database Schema

### Reminder Logs (Enhanced)

```sql
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  appointment_id UUID,
  message_content TEXT,
  
  -- Provider info
  provider TEXT, -- 'gupshup', 'twilio', 'email'
  provider_message_id TEXT,
  provider_status TEXT, -- 'submitted', 'delivered', 'read', 'failed'
  
  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Error info
  error_message TEXT,
  error_code TEXT,
  
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
)
```

### Gupshup Config

```sql
CREATE TABLE gupshup_config (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  
  -- Credentials
  app_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  UNIQUE(clinic_id)
)
```

### Incoming Messages

```sql
CREATE TABLE patient_messages (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  patient_id UUID,
  phone_number TEXT NOT NULL,
  
  message_text TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'document'
  
  provider TEXT DEFAULT 'gupshup',
  provider_message_id TEXT,
  
  processed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
)
```

---

## Examples

### Complete Flow: Send Reminder via Gupshup

```typescript
import { sendGupshupMessage } from '@/lib/gupshup/service'
import { createClient } from '@supabase/supabase-js'

async function sendAppointmentReminder(appointmentId: string, clinicId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch appointment & patient data
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, phone_number, name),
      doctor:doctors(id, name)
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment?.patient?.phone_number) {
    throw new Error('Patient phone number missing')
  }

  // 2. Fetch Gupshup config
  const { data: config } = await supabase
    .from('gupshup_config')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  if (!config?.is_verified) {
    throw new Error('Gupshup not configured or verified')
  }

  // 3. Format message
  const appointmentDate = new Date(appointment.appointment_date)
  const messageText = `Hi ${appointment.patient.name}, your appointment with Dr. ${appointment.doctor.name} is tomorrow at ${appointmentDate.toLocaleTimeString}. Please reply 'yes' to confirm.`

  // 4. Send via Gupshup
  const result = await sendGupshupMessage({
    clinicId,
    phoneNumberId: config.phone_number_id,
    apiKey: config.api_key,
    destination: appointment.patient.phone_number,
    messageText,
  })

  // 5. Log result
  if (result.success) {
    await supabase.from('reminder_logs').insert({
      clinic_id: clinicId,
      patient_id: appointment.patient.id,
      appointment_id: appointmentId,
      provider: 'gupshup',
      provider_message_id: result.messageId,
      provider_status: 'submitted',
      sent_at: new Date(),
    })
    
    console.log(`✅ Reminder sent to ${appointment.patient.name}`)
  } else {
    await supabase.from('reminder_logs').insert({
      clinic_id: clinicId,
      patient_id: appointment.patient.id,
      appointment_id: appointmentId,
      provider: 'gupshup',
      provider_status: 'failed',
      error_message: result.error,
    })
    
    console.error(`❌ Failed to send reminder: ${result.error}`)
  }

  return result
}
```

### Campaign: Send Bulk Reminders with Scheduling

```typescript
async function sendCampaignReminders(campaignId: string, clinicId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all pending reminders for this campaign
  const { data: reminders } = await supabase
    .from('reminder_logs')
    .select(`
      *,
      appointment:appointments(*),
      patient:patients(*)
    `)
    .eq('campaign_id', campaignId)
    .eq('provider_status', 'pending')
    .limit(100)

  // Send in batches to avoid rate limits
  const batchSize = 50
  const delayMs = 5000 // 5 seconds between batches

  for (let i = 0; i < reminders.length; i += batchSize) {
    const batch = reminders.slice(i, i + batchSize)
    
    // Send this batch in parallel
    await Promise.all(
      batch.map((reminder) =>
        sendAppointmentReminder(reminder.appointment_id, clinicId)
      )
    )

    // Wait before next batch
    if (i + batchSize < reminders.length) {
      console.log(`Batch ${i / batchSize + 1} sent, waiting ${delayMs}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  console.log(`✅ Campaign complete: ${reminders.length} reminders sent`)
}
```

---

**Last Updated**: April 8, 2026  
**Version**: 2.0  
**Maintained By**: Aura Digital Services Team