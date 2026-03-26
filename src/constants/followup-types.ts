import { Stethoscope, Calendar, Pill, FileText, Settings } from 'lucide-react'

export const FOLLOWUP_TYPES = [
  {
    id: 'post_treatment',
    name: 'Post-Treatment Check',
    icon: Stethoscope,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    defaultDays: 3,
    defaultTemplate: `Hi {{patient_name}}, it's been a few days since your {{service}}. How are you feeling?

If you have any discomfort, please let us know.`
  },
  {
    id: 'routine_checkup',
    name: 'Routine Checkup',
    icon: Calendar,
    color: 'text-green-600',
    bg: 'bg-green-50',
    defaultDays: 180,
    defaultTemplate: `Hi {{patient_name}}, it's time for your routine checkup at {{clinic_name}}.

Regular visits help maintain your health. Book now:
{{booking_link}}`
  },
  {
    id: 'medication_reminder',
    name: 'Medication Reminder',
    icon: Pill,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    defaultDays: 1,
    defaultTemplate: `Hi {{patient_name}}, this is a reminder to take your medication as prescribed.`
  },
  {
    id: 'test_results',
    name: 'Test Results',
    icon: FileText,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    defaultDays: 0,
    defaultTemplate: `Hi {{patient_name}}, your test results are ready. Please call us or book an appointment to discuss them.`
  },
  {
    id: 'pending_booking',
    name: 'Pending Booking',
    icon: Calendar,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    defaultDays: 3,
    defaultTemplate: `Hi {{patient_name}}, checking in regarding your appointment. Let us know when you're ready to book.`
  },
  {
    id: 'custom',
    name: 'Custom Follow-up',
    icon: Settings,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    defaultDays: 7,
    defaultTemplate: `Hi {{patient_name}}, checking in regarding your recent visit.`
  }
]
