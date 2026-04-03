/* ─────────────────────────────────────────────────────────────────
   Email templates for patient reminders
   Designed to look professional without feeling like bulk marketing
───────────────────────────────────────────────────────────────── */

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8fafc;
  margin: 0; padding: 0;
`

const CARD_STYLE = `
  max-width: 520px; margin: 32px auto; background: #ffffff;
  border-radius: 12px; border: 1px solid #e2e8f0;
  overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`

const HEADER_STYLE = `
  background: #059669; padding: 24px 32px;
  color: #ffffff;
`

const BODY_STYLE = `padding: 28px 32px; color: #334155;`

const FOOTER_STYLE = `
  padding: 16px 32px; background: #f8fafc;
  border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;
`

const BTN_STYLE = `
  display: inline-block; background: #059669; color: #ffffff;
  padding: 12px 24px; border-radius: 8px; text-decoration: none;
  font-weight: 600; font-size: 15px; margin-top: 16px;
`

function wrap(content: string): string {
  return `
  <!DOCTYPE html><html><body style="${BASE_STYLE}">
    <div style="${CARD_STYLE}">
      ${content}
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;padding:16px;">
      Sent via PatientFlow AI &middot;
      <a href="{{{unsubscribe_url}}}" style="color:#94a3b8;">Unsubscribe</a>
    </p>
  </body></html>`
}

export interface ReminderEmailData {
  patientName: string
  clinicName: string
  appointmentDate: string   // e.g. "Thursday, 10 April"
  appointmentTime: string   // e.g. "11:00 AM"
  doctorName?: string
  serviceName?: string
  rescheduleUrl?: string
  clinicPhone?: string
}

export function reminder24hTemplate(d: ReminderEmailData): { subject: string; html: string } {
  return {
    subject: `Reminder: Your appointment at ${d.clinicName} is tomorrow`,
    html: wrap(`
      <div style="${HEADER_STYLE}">
        <p style="margin:0;font-size:13px;opacity:0.8;">Appointment Reminder</p>
        <h1 style="margin:4px 0 0;font-size:22px;">See you tomorrow, ${d.patientName.split(' ')[0]}!</h1>
      </div>
      <div style="${BODY_STYLE}">
        <p style="margin-top:0;">This is a friendly reminder about your upcoming appointment:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:40%;">Clinic</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.clinicName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Date</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.appointmentDate}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Time</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.appointmentTime}</td></tr>
          ${d.doctorName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Doctor</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.doctorName}</td></tr>` : ''}
          ${d.serviceName ? `<tr><td style="padding:8px 0;color:#64748b;">Service</td>
              <td style="padding:8px 0;font-weight:600;">${d.serviceName}</td></tr>` : ''}
        </table>
        ${d.rescheduleUrl ? `<a href="${d.rescheduleUrl}" style="${BTN_STYLE}">Reschedule if needed</a>` : ''}
        ${d.clinicPhone ? `<p style="margin-top:20px;font-size:13px;color:#64748b;">Need to reach us? Call <strong>${d.clinicPhone}</strong></p>` : ''}
      </div>
      <div style="${FOOTER_STYLE}">
        Please arrive 5 minutes early. Bring any previous reports or prescriptions.
      </div>
    `),
  }
}

export function reminder3hTemplate(d: ReminderEmailData): { subject: string; html: string } {
  return {
    subject: `Your appointment at ${d.clinicName} is in a few hours`,
    html: wrap(`
      <div style="${HEADER_STYLE}">
        <p style="margin:0;font-size:13px;opacity:0.8;">Today&rsquo;s Appointment</p>
        <h1 style="margin:4px 0 0;font-size:22px;">Almost time, ${d.patientName.split(' ')[0]}!</h1>
      </div>
      <div style="${BODY_STYLE}">
        <p style="margin-top:0;">Your appointment is coming up soon:</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#166534;">${d.appointmentTime} &mdash; ${d.clinicName}</p>
          ${d.doctorName ? `<p style="margin:4px 0 0;color:#15803d;">${d.doctorName}${d.serviceName ? ` &middot; ${d.serviceName}` : ''}</p>` : ''}
        </div>
        ${d.clinicPhone ? `<p style="font-size:13px;color:#64748b;">Questions? Call us: <strong>${d.clinicPhone}</strong></p>` : ''}
      </div>
      <div style="${FOOTER_STYLE}">
        We look forward to seeing you today.
      </div>
    `),
  }
}

export function noShowRecoveryTemplate(d: ReminderEmailData): { subject: string; html: string } {
  return {
    subject: `We missed you today — want to reschedule?`,
    html: wrap(`
      <div style="${HEADER_STYLE.replace('#059669', '#0284c7')}">
        <h1 style="margin:0;font-size:22px;">We missed you, ${d.patientName.split(' ')[0]}</h1>
      </div>
      <div style="${BODY_STYLE}">
        <p style="margin-top:0;">You had an appointment at <strong>${d.clinicName}</strong> today. We hope everything is okay!</p>
        <p>If you'd like to reschedule, we'd love to have you come in.</p>
        ${d.rescheduleUrl ? `<a href="${d.rescheduleUrl}" style="${BTN_STYLE.replace('#059669','#0284c7')}">Book a new appointment</a>` : ''}
        ${d.clinicPhone ? `<p style="margin-top:20px;font-size:13px;color:#64748b;">Or call us directly: <strong>${d.clinicPhone}</strong></p>` : ''}
      </div>
      <div style="${FOOTER_STYLE}">
        ${d.clinicName} &middot; We care about your health.
      </div>
    `),
  }
}

export function postVisitTemplate(d: ReminderEmailData): { subject: string; html: string } {
  return {
    subject: `Thank you for visiting ${d.clinicName}`,
    html: wrap(`
      <div style="${HEADER_STYLE}">
        <h1 style="margin:0;font-size:22px;">Thank you for your visit!</h1>
      </div>
      <div style="${BODY_STYLE}">
        <p style="margin-top:0;">Hi ${d.patientName.split(' ')[0]}, thank you for visiting <strong>${d.clinicName}</strong>${d.doctorName ? ` and seeing ${d.doctorName}` : ''} today.</p>
        <p>We hope your experience was smooth and that you're feeling well.</p>
        <p style="font-size:13px;color:#64748b;">If you have any follow-up questions or need anything, don't hesitate to reach out.</p>
        ${d.clinicPhone ? `<p style="font-size:13px;color:#64748b;">📞 <strong>${d.clinicPhone}</strong></p>` : ''}
      </div>
      <div style="${FOOTER_STYLE}">
        See you at your next visit &mdash; ${d.clinicName}
      </div>
    `),
  }
}

export function bookingConfirmationTemplate(d: ReminderEmailData & { bookingRef?: string }): { subject: string; html: string } {
  return {
    subject: `Booking confirmed at ${d.clinicName} — ${d.appointmentDate}`,
    html: wrap(`
      <div style="${HEADER_STYLE}">
        <p style="margin:0;font-size:13px;opacity:0.8;">Booking Confirmed ✓</p>
        <h1 style="margin:4px 0 0;font-size:22px;">You're all set, ${d.patientName.split(' ')[0]}!</h1>
      </div>
      <div style="${BODY_STYLE}">
        <p style="margin-top:0;">Your appointment has been confirmed. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:40%;">Clinic</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.clinicName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Date</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.appointmentDate}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Time</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.appointmentTime}</td></tr>
          ${d.doctorName ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Doctor</td>
              <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:600;">${d.doctorName}</td></tr>` : ''}
          ${d.serviceName ? `<tr><td style="padding:8px 0;${d.bookingRef ? 'border-bottom:1px solid #f1f5f9;' : ''}color:#64748b;">Service</td>
              <td style="padding:8px 0;${d.bookingRef ? 'border-bottom:1px solid #f1f5f9;' : ''}font-weight:600;">${d.serviceName}</td></tr>` : ''}
          ${d.bookingRef ? `<tr><td style="padding:8px 0;color:#64748b;">Reference</td>
              <td style="padding:8px 0;font-weight:600;font-family:monospace;">${d.bookingRef}</td></tr>` : ''}
        </table>
        ${d.rescheduleUrl ? `<a href="${d.rescheduleUrl}" style="display:inline-block;background:#f1f5f9;color:#334155;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">Manage Appointment</a>` : ''}
      </div>
      <div style="${FOOTER_STYLE}">
        You will receive a WhatsApp reminder 24 hours before your appointment.
      </div>
    `),
  }
}
