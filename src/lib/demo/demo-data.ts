export type DemoClinic = {
  name: string
  speciality: string
  location: string
  doctor: string
  patientsServed: number
}

export type DemoStat = {
  label: string
  value: string
  trend: string
}

export type DemoLead = {
  id: string
  name: string
  phone: string
  source: string
  stage: 'New' | 'Contacted' | 'Interested' | 'Booked'
  lastContact: string
}

export type DemoMessage = {
  id: string
  from: 'clinic' | 'patient'
  text: string
  timestamp: string
}

export const demoClinic: DemoClinic = {
  name: 'Shree Dental & Implant Center',
  speciality: 'Dental Care',
  location: 'Koramangala, Bengaluru',
  doctor: 'Dr. Kavya Nair',
  patientsServed: 2480,
}

export const demoStats: DemoStat[] = [
  { label: 'Today Appointments', value: '26', trend: '+18% vs last week' },
  { label: 'No-Show Risk', value: '8%', trend: '-3% after reminders' },
  { label: 'WhatsApp Delivery', value: '97.6%', trend: 'Healthy quality score' },
  { label: 'Recovered Revenue', value: 'Rs 1.8L', trend: 'Last 30 days' },
]

export const demoLeads: DemoLead[] = [
  {
    id: 'lead-1',
    name: 'Ananya Rao',
    phone: '+91 98765 43210',
    source: 'Google Ads',
    stage: 'Interested',
    lastContact: '10 min ago',
  },
  {
    id: 'lead-2',
    name: 'Rohit Sharma',
    phone: '+91 99887 66554',
    source: 'Website Form',
    stage: 'Contacted',
    lastContact: '42 min ago',
  },
  {
    id: 'lead-3',
    name: 'Meera Iyer',
    phone: '+91 90011 22334',
    source: 'Instagram',
    stage: 'New',
    lastContact: '2 hr ago',
  },
  {
    id: 'lead-4',
    name: 'Sanjay Menon',
    phone: '+91 98123 44556',
    source: 'Referral',
    stage: 'Booked',
    lastContact: 'Yesterday',
  },
]

export const demoChats: Record<string, DemoMessage[]> = {
  'lead-1': [
    {
      id: 'm1',
      from: 'clinic',
      text: 'Hi Ananya, this is PatientFlow AI assistant from Shree Dental. Are you available for a quick consultation this week?',
      timestamp: '09:10 AM',
    },
    {
      id: 'm2',
      from: 'patient',
      text: 'Yes, I am looking for aligner options. Friday evening works best.',
      timestamp: '09:14 AM',
    },
    {
      id: 'm3',
      from: 'clinic',
      text: 'Great. We have slots at 6:00 PM and 6:30 PM. Which one should I hold for you?',
      timestamp: '09:16 AM',
    },
  ],
  'lead-2': [
    {
      id: 'm4',
      from: 'clinic',
      text: 'Hello Rohit, sharing your post-cleaning follow-up reminder.',
      timestamp: '11:04 AM',
    },
    {
      id: 'm5',
      from: 'patient',
      text: 'Thanks. Can we do this Saturday morning?',
      timestamp: '11:09 AM',
    },
  ],
  'lead-3': [
    {
      id: 'm6',
      from: 'clinic',
      text: 'Hi Meera, thanks for contacting us for root canal treatment. Would you like an estimate before booking?',
      timestamp: 'Yesterday',
    },
  ],
  'lead-4': [
    {
      id: 'm7',
      from: 'patient',
      text: 'Appointment confirmed for Tuesday 4 PM. Thank you!',
      timestamp: 'Yesterday',
    },
    {
      id: 'm8',
      from: 'clinic',
      text: 'Perfect. Looking forward to seeing you, Sanjay.',
      timestamp: 'Yesterday',
    },
  ],
}
