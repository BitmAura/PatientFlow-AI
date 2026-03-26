# WhatsApp Troubleshooting Guide

## 🔧 Common Issues & Quick Fixes

### "Connection Failed" Error

**Most Common Causes:**
1. **Invalid Phone Number ID** - Double-check you copied the correct ID
2. **Expired Access Token** - Generate a new token in Meta Developer dashboard
3. **Wrong API Version** - Make sure you're using the latest API version

**Quick Fix Steps:**
1. Go to your [Meta Developer Dashboard](https://developers.facebook.com/)
2. Navigate to your app → WhatsApp → Getting Started
3. Copy the "Phone Number ID" exactly as shown
4. Generate a new "Temporary Access Token"
5. Try connecting again

### "Messages Not Sending" Error

**Check These First:**
- ✅ **Phone Number Format**: Use international format (+1234567890)
- ✅ **Patient Opt-in**: Patients must have WhatsApp opt-in enabled
- ✅ **Message Credits**: Check if you have available message credits
- ✅ **Rate Limits**: Max 200 messages/day, 10 messages/minute

**Test Your Setup:**
1. Send a test message to yourself first
2. Check the message logs in Settings > WhatsApp
3. Verify patient phone numbers are valid

### "Webhook Errors" (Advanced)

**This is Optional** - Your messages will still work without webhooks!

If you want webhook functionality:
1. Ensure your domain is accessible from the internet
2. Check webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
3. Verify webhook secret matches your configuration
4. Test with a simple webhook first

## 📋 Step-by-Step API Setup

### 1. Create Meta Developer Account
```
1. Go to https://developers.facebook.com/
2. Click "Get Started" or "Log In"
3. Create a new app (Business type)
4. Add WhatsApp product to your app
```

### 2. Get Your Credentials
```
In your Meta Developer Dashboard:
1. Go to your app
2. Click "WhatsApp" in the left menu
3. Click "Getting Started" 
4. Find these values:
   - Phone Number ID: Copy this exactly
   - Temporary Access Token: Generate new token
   - Webhook Secret: (Optional) Set this for security
```

### 3. Configure Webhook (Optional)
```
1. In Meta Dashboard, go to Webhooks
2. Click "Add Webhook"
3. Set Callback URL: https://your-domain.com/api/webhooks/whatsapp
4. Set Verify Token: your-webhook-secret
5. Subscribe to these events:
   - messages
   - message_status
   - message_template_status
```

## 🚨 Error Codes Explained

| Error Code | What It Means | Quick Fix |
|------------|---------------|-----------|
| 401 | Unauthorized | Check your access token |
| 403 | Forbidden | Phone number not verified |
| 404 | Not Found | Wrong Phone Number ID |
| 429 | Rate Limited | Wait and try again |
| 500 | Server Error | Try again later |

## 💡 Pro Tips

### Before You Start
- **Use a business phone number** - Personal numbers don't work
- **Verify your business** - Complete Meta business verification
- **Test with sandbox** - Use the test phone number first

### Best Practices
- **Start small** - Test with 1-2 messages first
- **Monitor usage** - Check your message dashboard daily
- **Use templates** - Pre-approved messages work better
- **Get consent** - Always get patient opt-in first

### Security
- **Rotate tokens** - Generate new access tokens regularly
- **Use webhooks** - Get real-time message status
- **Limit access** - Only give API keys to trusted staff
- **Monitor logs** - Check for suspicious activity

## 🆘 Still Need Help?

### Contact Support
- **Live Chat**: Click the help button in your dashboard
- **Email**: support@noshowkiller.com
- **Phone**: 1-800-NO-SHOWS

### What to Include in Your Support Request
1. Your clinic name and account email
2. Screenshot of the error message
3. What step you're stuck on
4. Your API credentials (don't share the full token!)

### Emergency Support
If WhatsApp is completely down and affecting patient care:
- Call our emergency line: 1-800-NO-SHOWS-911
- Text "URGENT" to +1-555-NOSHOWS
- Email urgent@noshowkiller.com

---

**Remember**: You don't need to be a developer to use WhatsApp automation. Our support team can set everything up for you in just 5 minutes! 🏥💚