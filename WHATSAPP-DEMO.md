Refactor the application architecture for a SaaS product called "PatientFlow AI".

Goal:
Make the system multi-tenant, scalable, and independent of WhatsApp providers.

Requirements:

1. Multi-Clinic Architecture:
- Each clinic has isolated data (leads, patients, appointments)
- Use clinic_id for scoping across all tables

2. Messaging Abstraction Layer:
- Create a unified messaging service
- Support providers: Gupshup (primary), Meta Cloud API (fallback)

3. Structure:
- /services/messaging/
    - sendMessage()
    - receiveWebhook()
    - verifyNumber()
- /services/clinic/
- /services/leads/
- /services/appointments/

4. Provider Logic:
- If clinic.provider = "gupshup" → use Gupshup API
- Else → fallback to Meta API

5. Ensure:
- Loose coupling (easy provider switch)
- Clean service-based architecture

Tech:
- TypeScript
- Next.js backend routes

Implement WhatsApp integration module for PatientFlow AI.

Requirements:

1. Gupshup Integration:
- Send message API
- Receive webhook handler
- OTP verification flow
- Store app_id, api_key per clinic

2. Meta Cloud API (fallback):
- Send message API
- Webhook support

3. Database:
Each clinic must store:
- phone_number
- provider (gupshup/meta)
- credentials (securely)

4. Webhook Flow:
- Receive incoming message
- Identify clinic via phone number
- Route to internal message handler

5. Error Handling:
- Retry failed messages
- Log all message activity

6. Logging:
- Save all messages in message_logs table

Goal:
Reliable messaging layer independent of business logic.

Build automation engine for PatientFlow AI.

Goal:
Automate patient communication lifecycle.

Flows:

1. New Lead:
- Trigger: new lead created
- Action: send instant WhatsApp reply

2. Booking Flow:
- Capture patient info
- Suggest appointment slots
- Confirm booking

3. Reminder Engine:
- 24 hours before appointment
- 3 hours before appointment

4. No-show Recovery:
- If status = no-show → send reschedule message

5. Recall Engine:
- Identify inactive patients (30/60 days)
- Send reactivation messages

6. Follow-up:
- After appointment → feedback + review request

Structure:
- /services/automation/
- Event-driven triggers

Ensure:
- Configurable per clinic
- Logs for each automation action

Build onboarding wizard for PatientFlow AI.

Steps:

1. Clinic Details:
- Name
- Doctor name
- Services
- Working hours

2. WhatsApp Setup:
- Enter phone number
- OTP verification via Gupshup

3. Template Setup:
- Welcome message
- Reminder message
- No-show message
- Recall message

4. Test System:
- Send test message

5. Go Live:
- Mark clinic as active

UI:
- Step-by-step wizard
- Progress indicator

Goal:
Non-technical users can complete setup easily.

Enhance dashboard for PatientFlow AI to show business impact.

Add:

1. Metrics:
- Total Leads
- Booked Appointments
- No-Shows
- Recovered Patients
- Revenue Generated (calculated)

2. Funnel:
- Leads → Booked → Completed

3. Alerts:
- Unfollowed leads
- Missed appointments

4. Graphs:
- Weekly trends
- Conversion rates

Goal:
Make clinic owner clearly see ROI.

Build central message handler system.

Flow:

1. Receive webhook from provider
2. Identify clinic using phone_number
3. Identify user (existing patient or new lead)
4. Route message:

- New → create lead
- Booking → schedule appointment
- Existing → continue conversation

5. Trigger automation engine

Structure:
- /services/messages/handler.ts

Ensure:
- Scalable
- Stateless where possible
- Clean separation of concerns

Design scalable database schema for PatientFlow AI.

Tables:

1. clinics
2. staff
3. leads
4. patients
5. appointments
6. message_logs
7. automation_logs
8. whatsapp_configs

Requirements:
- All tables must include clinic_id
- Apply RLS for multi-tenancy
- Ensure performance for large data

Goal:
Support 100+ clinics without issues. (note already we have sql schema check and create new schemas)

Implement secure multi-tenant system.

Requirements:

1. Row Level Security:
- Clinics can only access their data

2. Staff Access:
- Role-based permissions

3. API Protection:
- Validate clinic_id on all requests

4. Webhooks:
- Verify provider signatures

Goal:
Prevent data leakage across clinics.