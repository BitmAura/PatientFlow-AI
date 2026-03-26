export const TEMPLATE_VARIABLES = [
  { key: 'patient_name', description: 'Full name of the patient', example: 'John Doe' },
  { key: 'patient_first_name', description: 'First name of the patient', example: 'John' },
  { key: 'doctor_name', description: 'Name of the doctor', example: 'Dr. Smith' },
  { key: 'clinic_name', description: 'Name of the clinic', example: 'Aura Dental' },
  { key: 'date', description: 'Appointment date', example: 'Oct 24, 2024' },
  { key: 'time', description: 'Appointment time', example: '10:00 AM' },
  { key: 'service', description: 'Service booked', example: 'Root Canal' },
  { key: 'clinic_address', description: 'Full address of the clinic', example: '123 Health St, NY' },
  { key: 'clinic_phone', description: 'Clinic contact number', example: '+1 555-0123' },
  { key: 'maps_link', description: 'Google Maps link to clinic', example: 'https://maps.google.com/?q=...' },
  { key: 'booking_link', description: 'Link to book new appointment', example: 'https://app.aura.me/book' },
  { key: 'deposit_amount', description: 'Required deposit amount', example: '$50.00' },
  { key: 'payment_link', description: 'Link to pay deposit', example: 'https://stripe.com/...' },
]

export const DEFAULT_TEMPLATES = {
  booking_confirmation: `🏥 *Appointment Confirmed*

Hi {{patient_name}},

Your appointment is confirmed:
👨‍⚕️ {{doctor_name}}
📅 {{date}} at {{time}}
💊 {{service}}

📍 {{clinic_address}}

Reply C to confirm, R to reschedule, X to cancel.`,

  reminder_24h: `⏰ *Reminder: Appointment Tomorrow*

Hi {{patient_name}},

Your appointment is tomorrow:
📅 {{date}} at {{time}}
👨‍⚕️ {{doctor_name}}

📍 {{clinic_address}}
🗺️ {{maps_link}}

Reply C to confirm attendance.`,

  reminder_2h: `🔔 *See You Soon!*

Hi {{patient_name}},

Your appointment is in 2 hours:
⏰ {{time}} today
📍 {{clinic_address}}

Running late? Please let us know!`,

  no_show_followup: `We missed you today, {{patient_name}}.

Your appointment was at {{time}} but we didn't see you.

To reschedule: {{booking_link}}

Or reply BOOK to schedule.`,

  post_visit_message: `👋 *Thank You for Visiting*

Hi {{patient_name}}, thanks for visiting {{clinic_name}} today.

How was your experience?
We'd love your feedback!

Reply 1-5 (5 being best) to rate us.`
}

export function buildMessage(template: string, variables: Record<string, string>): string {
  let message = template
  
  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    // Handle both {{key}} and {{ key }} (with spaces)
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    message = message.replace(regex, value)
  })

  // Check for remaining variables that weren't replaced (optional warning logic could go here)
  
  return message
}

export function validateTemplate(template: string): { valid: boolean; error?: string } {
  if (!template.trim()) {
    return { valid: false, error: 'Template cannot be empty' }
  }
  
  if (template.length > 4096) {
    return { valid: false, error: 'Template exceeds WhatsApp limit of 4096 characters' }
  }

  // Check for invalid variables format (e.g. unclosed braces)
  const openBraces = (template.match(/{{/g) || []).length
  const closeBraces = (template.match(/}}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { valid: false, error: 'Mismatched variable braces {{ }}' }
  }

  return { valid: true }
}
