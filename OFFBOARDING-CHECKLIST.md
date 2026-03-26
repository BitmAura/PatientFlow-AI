# 📉 Internal Offboarding Checklist - Aura Recall

This document outlines the standard operating procedure (SOP) for offboarding a clinic from Aura Recall. Follow these steps strictly to ensure a clean exit, prevent unauthorized billing, and maintain data compliance.

## 📋 Offboarding Process

| Status | Step | Action Item | Responsibility | Notes |
| :---: | :---: | :--- | :--- | :--- |
| [ ] | 1 | **Receive cancellation request**<br>Log the request source (Email/WhatsApp/Call) and reason for cancellation in the CRM/Support Ticket system. | Support Team | Ensure the request date is recorded for billing pro-ration. |
| [ ] | 2 | **Pause automation immediately**<br>Disable the clinic's account in the Admin Dashboard to stop all scheduled messages instantly. | Ops / Tech Lead | **CRITICAL**: This prevents any further messages from being sent while offboarding is processed. |
| [ ] | 3 | **Confirm offboarding with doctor**<br>Contact the doctor or clinic manager to confirm the cancellation request and understand if it's reversible or final. | Customer Success | Try to retain the customer if possible. If final, proceed to next steps. |
| [ ] | 4 | **Deregister WhatsApp number via BSP**<br>Initiate the number deregistration process with the Business Solution Provider (e.g., Meta/360dialog) to release the number. | Tech Lead | This releases the number so the clinic can use it elsewhere if they wish. |
| [ ] | 5 | **Verify no outbound messages possible**<br>Send a test message to a control number from the system for this account to ensure it fails/is blocked. | QA / Ops | Verification step to ensure 100% compliance. |
| [ ] | 6 | **Notify doctor**<br>Send a formal confirmation email stating the account is closed, data retention policy, and final date of service. | Customer Success | Include instructions on how they can download their data if applicable. |
| [ ] | 7 | **Close billing**<br>Cancel the subscription in Razorpay/Stripe and ensure no future invoices are generated. Process any refunds if applicable. | Finance / Ops | Verify the "Next Billing Date" is cancelled. |

## ⚠️ Critical Checks
- **Data Retention**: Ensure patient data is archived or deleted according to the Data Processing Agreement (DPA) and GDPR/HIPAA requirements.
- **Access Revocation**: Remove any staff access to the clinic's dashboard.
- **Integration**: If integrated with a PMS (e.g., Dentally, Cliniko), ensure the API connection is revoked.

## 📞 Emergency Rollback
If the clinic changes their mind within the **cooling-off period (7 days)**:
1. Reactivate the subscription.
2. Re-enable automation in the Admin Dashboard.
3. If WhatsApp number was not yet deregistered, verify it is still active. If deregistered, a new onboarding flow is required.

---
**Last Updated**: 2026-02-10
**Owner**: Operations Team
