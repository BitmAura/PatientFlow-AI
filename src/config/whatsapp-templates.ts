export const recallTemplates = {
  // First Message: Polite, Care-focused
  // Trigger: On the day the patient becomes eligible for recall (Day 0)
  first_recall: {
    id: 'recall_initial_01',
    category: 'UTILITY', // Using Utility category for follow-up care
    body: `Hello {{1}},

This is a gentle reminder from *{{2}}* that your {{3}} check-up is due.

Regular visits help us ensure your continued health and catch any potential issues early.

Please click the link below to choose a time that works best for you.

[Button: Book Appointment] {{4}}`,
    variables: ['patient_name', 'clinic_name', 'treatment_type', 'booking_link'],
    example: "Hello Rahul, This is a gentle reminder from *Smile Dental* that your dental hygiene check-up is due... [Button] https://book.com/123"
  },

  // Second Message: Helpful nudge
  // Trigger: 3 days after the first message if no action taken
  second_reminder: {
    id: 'recall_followup_02',
    category: 'UTILITY',
    body: `Namaste {{1}},

We noticed you haven't booked your {{2}} check-up at *{{3}}* yet.

Prioritizing this visit ensures your treatment plan stays on track. It only takes a minute to schedule.

If you have any questions or need to speak with us, please reply to this message.

[Button: Schedule Visit] {{4}}`,
    variables: ['patient_name', 'treatment_type', 'clinic_name', 'booking_link'],
    example: "Namaste Rahul, We noticed you haven't booked your dental hygiene check-up at *Smile Dental* yet..."
  },

  // Final Message: Respectful closure (Opt-out friendly)
  // Trigger: 7 days after the first message if no action taken
  final_reminder: {
    id: 'recall_final_03',
    category: 'UTILITY',
    body: `Hi {{1}},

This is our final reminder regarding your due {{2}} check-up at *{{3}}*.

We understand you might be busy. We won't send further automated reminders about this specific visit.

Whenever you are ready to come in, we are here for you.

[Button: Book Anytime] {{4}}`,
    variables: ['patient_name', 'treatment_type', 'clinic_name', 'booking_link'],
    example: "Hi Rahul, This is our final reminder regarding your due dental hygiene check-up at *Smile Dental*..."
  }
};
