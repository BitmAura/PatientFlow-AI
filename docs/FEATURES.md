# Features Guide

## 1. Doctors Management

Allows clinics to support multiple practitioners with distinct schedules.

**Capabilities:**
- **Profiles**: Photo, bio, specialization, qualification.
- **Availability**: Override clinic business hours with custom weekly schedules or specific blocked dates.
- **Service Linking**: Assign specific services to specific doctors.
- **Booking**: Patients can select a preferred doctor or "Any Available".

**Configuration:**
- Go to `Settings > Doctors`.
- Toggle "Show on booking page" to hide internal staff.

## 2. Waiting List

Automated queue management for overbooked slots.

**Flow:**
1. Receptionist adds patient to waitlist with date/time preferences.
2. When a slot opens (cancellation), system checks waitlist for matches.
3. Staff can click "Notify" to send WhatsApp message.
4. Patient replies to claim slot.
5. Staff converts waitlist entry to appointment.

**Smart Matching:**
- Matches by Service duration.
- Matches by Patient preferred days/times (Morning/Afternoon).
- Prioritizes by "Priority" level (High/Medium/Low).

## 3. Automated Reminders

Reduces no-shows by keeping patients informed.

**Schedule:**
- **Confirmation**: Sent immediately upon booking.
- **48h Reminder**: Sent 2 days before (Email/WhatsApp).
- **24h Reminder**: Sent 1 day before (WhatsApp high priority).
- **2h Reminder**: Urgent SMS/WhatsApp on the day.

**Configuration:**
- Go to `Settings > Reminders`.
- Toggle specific reminders on/off.
- Customize templates (Enterprise plan).

## 4. Booking Deposits

Secures revenue and commits patients.

**Integration:**
- Uses Razorpay Payment Links.
- Configurable per Service (e.g., "Consultation" requires ₹500 deposit).
- Refund logic handled manually in dashboard (for now).

**Flow:**
1. Patient selects service.
2. If deposit > 0, redirected to Razorpay.
3. Payment success -> Appointment confirmed.
4. Payment failure -> Slot released after 10 mins.

## 5. Campaigns

Marketing tools for patient retention.

**Types:**
- **Recall**: "It's been 6 months since your last dental cleaning."
- **Birthday**: Automated greetings with offers.
- **General**: Announcements (e.g., "New Dermatologist joining").

**Audience Builder:**
- Filter by Last Visit Date.
- Filter by Service Type.
- Filter by Tag (VIP, Chronic, etc.).
