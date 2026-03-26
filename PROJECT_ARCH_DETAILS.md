# NoShowKiller: Project Architecture & Technical Documentation

## 🚀 Overview
**NoShowKiller** is a production-grade, healthcare-focused SaaS platform developed by **Aura Digital Services**. It is specifically designed to address the "Leaky Bucket" problem in medical clinics:
1.  **Top Leak (Ads → Leads)**: Losing potential patients due to slow follow-ups.
2.  **Middle Leak (Leads → Show-up)**: Patients booking but failing to arrive for appointments.
3.  **Bottom Leak (Treatment → Retention)**: Failing to retain patients for recurring treatments.

---

## 🏗 Architectural Design

### 1. High-Level Architecture
The platform follows a **Modern Full-Stack Serverless Architecture** using the Next.js App Router and Supabase.

-   **Frontend**: Next.js 14 (App Router) for a high-performance, SEO-friendly, and mobile-responsive user interface.
-   **Backend**: Supabase providing a managed PostgreSQL database, Authentication, and Realtime capabilities.
-   **API Layer**: Next.js Route Handlers (API Routes) acting as the bridge between the frontend and external integrations (WhatsApp, Razorpay).
-   **Integration Layer**: External services connected via webhooks and REST APIs.

### 2. The "Profit Loop" Engine
The system is built as an **Automated Revenue Manager** rather than just a calendar:
-   **Phase 1 (Lead Catcher)**: Mini-CRM for pre-booking lead management.
-   **Phase 2 (No-Show Killer)**: Booking management with deposit collection.
-   **Phase 3 (Patient Retention)**: Automated recall and follow-up engine.

---

## 🛠 Technology Stack

### **Core Frameworks**
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
-   **Internationalization**: `next-intl` (Native support for English and Hindi)

### **Backend & Database**
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
-   **Authentication**: [Supabase Auth](https://supabase.com/auth) (JWT, OAuth, OTP)
-   **Storage**: Supabase Storage for patient documents and reports.
-   **State Management**: 
    -   **Server State**: [@tanstack/react-query](https://tanstack.com/query/latest) for caching and data fetching.
    -   **Client State**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) for lightweight global UI state.

### **Third-Party Integrations**
-   **Payments**: [Razorpay](https://razorpay.com/) (Indian market leader for deposits).
-   **Communications**: 
    -   **WhatsApp Business API**: Automated reminders, status updates, and marketing campaigns.
    -   **Resend**: Transactional email delivery.
-   **Reporting & Exports**: 
    -   `recharts`: Interactive dashboard analytics.
    -   `jspdf`: Dynamic PDF generation for invoices and reports.
    -   `xlsx` / `papaparse`: CSV/Excel data handling.

---

## 📦 Key Modules & Features

### 1. Dashboard & Analytics
-   **Real-time Metrics**: Tracking Revenue, Appointment volume, and No-show rates.
-   **Trend Analysis**: Interactive charts showing busiest clinic hours and treatment popularity.
-   **Activity Feed**: Live updates on patient arrivals, bookings, and payments.

### 2. Lead Management System (LMS)
-   **Capture**: Automatic lead capture from Meta/Google Ads.
-   **CRM**: Pipeline tracking (`New` → `Contacted` → `Converted`).
-   **Instant Action**: "Staff Alerts" for immediate follow-up on "Hot Leads".

### 3. Appointment & Booking System
-   **Booking Wizard**: A patient-facing multi-step flow for selecting services and doctors.
-   **Deposit Collection**: Integrated Razorpay flow to secure bookings with an advance payment.
-   **Calendar Management**: Admin dashboard with drag-and-drop rescheduling.

### 4. No-Show Prevention Suite
-   **Smart Reminders**: Automated WhatsApp sequences at 48h, 24h, and 2h before appointments.
-   **Waiting List**: Automated "Slot Opener" that notifies waitlisted patients when a cancellation occurs.
-   **Self-Service Portal**: Secure links for patients to reschedule or cancel without calling the clinic.

### 5. Patient Retention (Recalls)
-   **Recall Engine**: Automated reminders for 6-month checkups or recurring treatments.
-   **Campaigns**: Segmented WhatsApp marketing based on patient history.

---

## 📂 Project Structure

```bash
src/
├── app/                  # Next.js Routes & API
│   ├── (auth)/           # Login, Signup, Onboarding
│   ├── (dashboard)/      # Clinic Admin Interface
│   ├── (patient-portal)/ # Patient Self-Service
│   ├── (public)/         # Marketing & Booking Pages
│   └── api/              # Serverless Function Endpoints
├── components/           # UI Components
│   ├── appointments/     # Calendar, Booking Wizard
│   ├── billing/          # Razorpay, Invoicing
│   ├── leads/            # LMS Pipeline
│   └── ui/               # shadcn/ui base components
├── lib/                  # Core Utilities
│   ├── supabase/         # DB Clients & Types
│   ├── whatsapp/         # API Integration Logic
│   └── utils.ts          # Shared Helper Functions
├── messages/             # i18n Translation Files (en.json, hi.json)
└── types/                # Global TypeScript Definitions
```

---

## 📱 Mobile & PWA
The application is built as a **Progressive Web App (PWA)**:
-   **Installable**: Home screen shortcut for clinic staff.
-   **Responsive**: Optimized for low-end Android devices common in Tier 2/3 cities.
-   **Offline Ready**: Service workers for caching critical assets.

## 🔄 Aura Ecosystem Integration
NoShowKiller is integrated with the main Aura Digital Services website via a **Cross-Service Toggle**:
-   **Floating Toggle**: Allows seamless switching between the marketing website and the SaaS app.
-   **Shared Configuration**: Centrally managed integration script (`aura-toggle-integration.js`).
-   **Service Selector**: Intelligent popup for new visitors to choose their path (Marketing Services vs. Practice Management).

## 🛡️ Security & Reliability
-   **RBAC**: Role-Based Access Control (Admin, Doctor, Receptionist).
-   **RLS**: Row-Level Security in Supabase ensuring data isolation between clinics.
-   **Validation**: Strict schema validation using [Zod](https://zod.dev/).
-   **Error Handling**: Centralized error logging and user-friendly notifications via `sonner`.

---

**Documentation Version**: 1.0.0
**Last Updated**: 2026-02-13
**Author**: Aura Digital Services AI Assistant