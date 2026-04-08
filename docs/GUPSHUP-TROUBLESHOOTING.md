# Gupshup Troubleshooting Guide

## Quick Diagnostics

### Check Gupshup Connection Status
In PatientFlow dashboard:
1. Go to **Settings > WhatsApp Connection**
2. Look for status badge:
   - **🟢 Connected**: All systems working
   - **🟡 Pending**: Waiting for verification
   - **🔴 Disconnected**: Setup required or issue detected

### Run Self-Diagnostic
1. Go to **Settings > WhatsApp Connection**
2. Click **"Test Connection"**
3. Enter your phone number
4. Wait for test message (should arrive in 3-5 seconds)
5. If test fails, see troubleshooting section below

---

## Common Issues & Solutions

### 1. "Invalid Credentials" Error

**Symptoms:**
- Red error when connecting
- "API Key invalid" or "App ID invalid"
- Connection fails immediately

**Root Causes:**
- Copied credentials incorrectly (extra spaces, wrong format)
- Credentials expired or revoked
- Wrong Gupshup account
- Typo in environment variables

**Solution:**
1. Log in to Gupshup dashboard at https://gupshup.io/dashboard
2. Navigate to **Settings > API & SDK**
3. **Copy credentials exactly** (avoid extra spaces):
   - **App ID**: Usually alphanumeric (e.g., `abc123xyz`)
   - **API Key**: Long string starting with format like `api_...`
4. Paste into PatientFlow (or .env file)
5. Try connecting again
6. If still fails, regenerate API key in Gupshup dashboard

**Prevention:**
- Use copy button in Gupshup dashboard (not manual copy)
- Avoid copying from email/screenshots
- Verify credentials in dashboard before pasting

---

### 2. "Phone Number Not Verified" Error

**Symptoms:**
- Messages fail to send
- "Authentication failed for this phone"
- "Number not registered with Gupshup"

**Root Causes:**
- Phone number not registered on Gupshup
- OTP verification incomplete
- Wrong phone number format

**Solution:**
1. In Gupshup dashboard, go to **Phone Numbers**
2. Verify your clinic's number is listed and marked as **"Verified"**
3. If not verified:
   - Click "Add Phone Number"
   - Enter your clinic's WhatsApp number (with country code)
   - Wait for OTP to arrive via SMS
   - Enter OTP to complete verification
4. In PatientFlow, update **Phone Number ID** field with the verified number
5. Test again

**Note:** Only verified numbers can send messages. Unverified accounts can send max 200 messages/day.

---

### 3. "Message Not Sending" Error

**Symptoms:**
- Test message doesn't arrive
- Status shows "failed" in logs
- No error message in UI

**This is Usually a Network/Rate Limit Issue:**

**Check Rate Limits:**
- Max 20 messages/minute to same phone
- Max 200 messages/day from unverified account
- If sending many messages, they may be queued

**Check Patient Phone Numbers:**
- Format must be 10 digits (India): `9988776655`
- With country code: `919988776655`
- Invalid formats won't be sent

**Check Internet Connectivity:**
- Ensure server has internet access
- Check firewall allows `api.gupshup.io`
- No corporate proxy blocking

**Solution Steps:**
1. Check patient phone number format in database
2. Send one test message to your own phone first
3. If that works, issue is patient-specific
4. If test fails, check network connectivity:
   ```bash
   curl -I https://api.gupshup.io/wa/api/v1
   # Should return HTTP 404 or similar, not connection timeout
   ```
5. Check logs in PatientFlow: Settings > Message Logs
6. Look for error details in log entry

---

### 4. "Rate Limited" (429 Error)

**Symptoms:**
- Getting 429 HTTP status codes
- Messages sent but subsequent ones fail
- Errors mention "quota" or "too many requests"

**Root Cause:**
- Too many messages sent in short time
- Campaign with 100+ messages triggered at once

**Solution:**
1. The system automatically retries with exponential backoff ✅
2. For campaigns, use **"Schedule"** option to stagger sending:
   - Instead of sending 1000 messages at once
   - Schedule sending 50 messages every 5 minutes over an hour
3. Upgrade to verified Gupshup account for higher limits:
   - Unverified: 200 messages/day
   - Verified: 2000+ messages/day

**Prevention:**
- Use campaign scheduling (available in Marketing section)
- Don't manually trigger large bulk sends
- Monitor message logs for bulk sends

---

### 5. "Webhook Signature Invalid" Error

**Symptoms:**
- Webhook endpoint returns 401 error
- Status updates not being recorded
- Patient messages don't trigger follow-ups

**Root Cause:**
- Webhook secret doesn't match in Gupshup and PatientFlow
- Signature verification disabled

**Solution:**
1. In Gupshup dashboard, go to **Settings > Webhooks**
2. Find your webhook entry
3. Check **Webhook Secret** value
4. In PatientFlow `.env` file, ensure:
   ```bash
   GUPSHUP_WEBHOOK_SECRET=<same-value-as-gupshup>
   ```
5. Restart application if env var changed
6. Test webhook by sending a test message from Gupshup dashboard

**If Webhook Still Not Working:**
- Webhook is optional for basic messaging ✅
- Messages will still send and be logged
- You just won't get real-time delivery status
- Can be enabled later

---

### 6. "OTP Failed" or "OTP Expired" During Setup

**Symptoms:**
- OTP doesn't arrive via SMS
- "OTP invalid" error after entering code
- "Registration timed out"

**Root Causes:**
- OTP expired (valid for 10 minutes only)
- SMS didn't deliver
- Wrong phone number
- Network issues during registration

**Solution:**
1. Check your phone for SMS from Gupshup (may come from short code)
2. If no SMS after 2 minutes:
   - Ensure phone can receive SMS (network may be blocking)
   - Try from different network (switch from WiFi to mobile data)
   - Wait 5 minutes and try again
3. If OTP received but keeps returning "invalid":
   - Wait for new OTP (first may have expired)
   - Copy OTP exactly (spaces/formatting matter)
   - Try again within 10 minutes
4. If still failing:
   - Choose "Manual Setup" option
   - Enter credentials directly instead of auto-registration

---

### 7. "Phone Already Registered" Error

**Symptoms:**
- Can't register phone number
- "This phone number is already registered to another account"
- Number shows in Gupshup but you don't have access

**Root Cause:**
- Phone was registered to different Gupshup account
- Phone was previously registered by mistake

**Solution - Option A: Use Different Number**
- Register a different clinic WhatsApp number
- Or request number to be freed (contact Gupshup support)

**Solution - Option B: Switch Gupshup Accounts**
1. Log in to the Gupshup account where number is registered
2. Verify it's your account
3. Get credentials from that account
4. Use those credentials in PatientFlow

---

### 8. "Connection Timeout" or "Network Error"

**Symptoms:**
- "Failed to reach Gupshup API"
- "Connection timeout" during testing
- Gupshup API returns 503 or similar

**Root Causes:**
- Gupshup API temporarily down
- Network connectivity issue
- Firewall blocking
- DNS resolution failing

**Check Gupshup Status:**
1. Visit https://status.gupshup.io/
2. Look for any ongoing incidents
3. If red alert, wait for resolution

**Check Network:**
```bash
# Can you reach Gupshup servers?
ping api.gupshup.io
curl https://api.gupshup.io/wa/api/v1

# Check firewall
netstat -an | grep 443  # Should show ESTABLISHED connections
```

**Solution:**
- If Gupshup is down: Wait for their team to fix (usually <1 hour)
- If network issue: Contact your IT team
- Retry after 5 minutes (transient issues)
- Switch to Meta Cloud API as fallback (in development)

---

### 9. Clinic Can See WhatsApp Status as "Connected" but Messages Not Sending

**Symptoms:**
- Green "Connected" badge visible
- Settings show all credentials entered
- But messages fail to send
- Other clinics' WhatsApp working fine

**Root Causes:**
- Credentials valid but phone number not properly registered
- Plan limits exceeded
- Gupshup subscription paused

**Solution:**
1. Check subscription in Gupshup dashboard:
   - Go to **Settings > Subscription**
   - Ensure plan is active (not expired)
   - Check monthly quota not exceeded
2. Log in and verify phone number status:
   - Go to Gupshup **Phone Numbers**
   - Find your number
   - Check status is "Active" (green)
3. Check PatientFlow logs:
   - Settings > Message Logs
   - Filter by this clinic
   - Look for error pattern
4. If credentials recently changed:
   - Update in PatientFlow Settings
   - Click "Test Connection"
5. Contact Gupshup support if subscription issue

**Temporary Workaround:**
- Switch to Meta Cloud API (if configured)
- Messages will still send via alternative channel
- Restore Gupshup once issue is fixed

---

### 10. "Webhook Delivery Failed" (Advanced)

**Symptoms:**
- Status updates not syncing
- Delivery receipts not recorded
- Gupshup dashboard shows webhook errors

**Root Cause:**
- Webhook endpoint not responding in time (timeout)
- Endpoint returning 4xx/5xx errors
- Network issues from Gupshup to your server

**Solution:**
1. Test webhook endpoint:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/gupshup \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   # Should return 200 OK
   ```
2. Check server logs for errors
3. Ensure endpoint responds within 30 seconds
4. For high volume, consider webhook queue/worker:
   - Don't process webhooks synchronously
   - Queue them and process in background
5. Add timeout handling to webhook processor

**Note:** Webhooks are optional. Core messaging works without them.

---

## Getting Help

### For Product Issues:
- **Live Chat**: Click help icon in dashboard (during business hours)
- **Email**: support@patientflow.ai
- **Docs**: See GUPSHUP-SETUP-GUIDE.md

### For Gupshup Account Issues:
- **Gupshup Support**: https://gupshup.io/support
- **Gupshup Status**: https://status.gupshup.io/
- **Gupshup Docs**: https://www.gupshup.io/developer/

### When Contacting Support, Provide:
1. Clinic name and ID
2. Phone number being used
3. Specific error message (screenshot if possible)
4. When issue started
5. Steps to reproduce
6. **Do NOT send API keys or secrets**

---

## Performance Tuning

### For High-Volume Messaging (1000+ messages/day)

**1. Verify Gupshup Account**
```bash
# Unverified: 200 msg/day, verified: 2000+ msg/day
# Contact Gupshup to increase quota
```

**2. Batch Message Sending**
```javascript
// DON'T: Send 1000 messages in a loop immediately
for (let i = 0; i < phones.length; i++) {
  await sendMessage(phones[i])  // ❌ Rate limited
}

// DO: Batch with delays
for (let i = 0; i < phones.length; i += 50) {
  await Promise.all(phones.slice(i, i + 50).map(sendMessage))
  await wait(5000)  // ✅ 50 messages every 5 seconds
}
```

**3. Use Campaign Scheduling**
- Instead of instant send
- Schedule messages over time
- Natural delivery pattern

**4. Implement Retry Queue**
```bash
# Already implemented in PatientFlow ✅
# Auto-retries failed messages with exponential backoff
# Max 3 attempts per message
```

---

## Testing Checklist

Before launching WhatsApp automation, verify:

- [ ] Can send test message to your phone
- [ ] Can send to 5-10 patient phone numbers
- [ ] Can receive incoming messages
- [ ] Webhook status updates are recording
- [ ] Message logs show all activities
- [ ] Retry mechanism works (unplug internet, verify retry)
- [ ] Rate limiting works (100 msg in 1 min shows queuing)
- [ ] Campaign scheduling works
- [ ] Patient opt-out functionality works
- [ ] Error notifications working

---

## FAQ

**Q: Do I need a Gupshup account?**
A: Yes, either create your own or let us set one up for you (Quick Setup option).

**Q: Can I switch from Gupshup to Meta WhatsApp later?**
A: Yes! Both providers supported. Can switch anytime.

**Q: What if Gupshup is down?**
A: We retry automatically. If persistent, switch to Meta Cloud API temporarily.

**Q: How much does Gupshup cost?**
A: Starts free, then per-message rates (~₹0.35-1 per message depending on volume).

**Q: Is WhatsApp mandatory for reminders?**
A: No. SMS and Email are fallbacks. WhatsApp recommended for highest engagement.

---

**Last Updated**: April 8, 2026  
**Version**: 1.0