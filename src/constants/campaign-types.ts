import { Calendar, UserX, Gift, Tag, Sparkles, PartyPopper, Settings } from 'lucide-react'

export const CAMPAIGN_TYPES = [
  {
    id: 'checkup_reminder',
    name: 'Checkup Reminder',
    description: "Remind patients who haven't visited in a while",
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    defaultTemplate: `Hi {{patient_name}},

It's been a while since your last visit to {{clinic_name}}!

Regular checkups help maintain good health. Book your appointment today:
{{booking_link}}

Or reply BOOK and we'll call you.`
  },
  {
    id: 'no_show_reengagement',
    name: 'No-Show Re-engagement',
    description: 'Win back patients who missed appointments',
    icon: UserX,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    defaultTemplate: `Hi {{patient_name}},

We noticed you missed your last appointment. We'd love to see you!

Life gets busy - no worries. Let's reschedule:
{{booking_link}}

Reply BOOK to schedule.`
  },
  {
    id: 'birthday_wishes',
    name: 'Birthday Wishes',
    description: 'Send greetings to patients celebrating soon',
    icon: Gift,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    defaultTemplate: `🎂 Happy Birthday, {{patient_name}}!

Wishing you a wonderful day from all of us at {{clinic_name}}.

As a birthday gift, enjoy 10% off your next visit. Book now:
{{booking_link}}`
  },
  {
    id: 'special_offer',
    name: 'Special Offer',
    description: 'Promote discounts and limited-time deals',
    icon: Tag,
    color: 'text-green-600',
    bg: 'bg-green-50',
    defaultTemplate: `🌟 Special Offer at {{clinic_name}}!

Get 20% off on all teeth cleaning services this week.

Limited slots available. Book now:
{{booking_link}}`
  },
  {
    id: 'new_service',
    name: 'New Service',
    description: 'Announce new treatments or facilities',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    defaultTemplate: `✨ Introducing a New Service!

We are excited to announce that we now offer Laser Whitening at {{clinic_name}}.

Learn more and book your consultation:
{{booking_link}}`
  },
  {
    id: 'festival_greetings',
    name: 'Festival Greetings',
    description: 'Send wishes for holidays and festivals',
    icon: PartyPopper,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    defaultTemplate: `Happy Holidays, {{patient_name}}! 🎆

Wishing you and your family joy and prosperity.

Warm regards,
{{clinic_name}}`
  },
  {
    id: 'custom',
    name: 'Custom Campaign',
    description: 'Create your own audience filters and message',
    icon: Settings,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    defaultTemplate: `Hi {{patient_name}},

[Your message here]

{{clinic_name}}`
  }
]
