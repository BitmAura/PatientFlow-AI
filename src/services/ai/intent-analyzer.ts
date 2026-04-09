/**
 * AI Intent Analyzer
 * 🧠 The "Brain" of PatientFlow AI
 */

export interface PatientIntent {
  category: 'appointment_request' | 'reschedule' | 'cancel' | 'billing' | 'symptom_emergency' | 'complaint' | 'general_chat' | 'unknown';
  urgency: 'critical' | 'high' | 'normal' | 'low';
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
  interventionRequired: boolean;
  summary: string;
}

/**
 * analyzes incoming text to extract structured intent.
 * In production, this calls Gemini 1.5 Pro or GPT-4o.
 */
export async function analyzePatientIntent(text: string): Promise<PatientIntent> {
  const input = text.trim().toLowerCase();

  // MOCK LOGIC: Placeholder for real LLM Call
  // (In a real implementation, we'd use generative AI here)
  
  if (input.includes('pain') || input.includes('bleeding') || input.includes('emergency') || input.includes('swollen')) {
    return {
      category: 'symptom_emergency',
      urgency: 'critical',
      sentiment: 'neutral',
      interventionRequired: true,
      summary: 'Patient reports physical distress/emergency symptoms.'
    };
  }

  if (input.includes('cancel') || input.includes('cannot come') || input.includes('not coming')) {
    return {
      category: 'cancel',
      urgency: 'high',
      sentiment: 'neutral',
      interventionRequired: true,
      summary: 'Patient intends to cancel the appointment.'
    };
  }

  if (input.includes('cost') || input.includes('price') || input.includes('expensive') || input.includes('discount')) {
    return {
      category: 'billing',
      urgency: 'normal',
      sentiment: 'neutral',
      interventionRequired: false,
      summary: 'Patient inquiring about pricing or financial terms.'
    };
  }

  if (input.includes('thank') || input.includes('great') || input.includes('nice')) {
    return {
      category: 'general_chat',
      urgency: 'low',
      sentiment: 'positive',
      interventionRequired: false,
      summary: 'Positive feedback or politeness.'
    };
  }

  // Fallback
  return {
    category: 'unknown',
    urgency: 'normal',
    sentiment: 'neutral',
    interventionRequired: false,
    summary: 'Unstructured message detected.'
  };
}

/**
 * Suggested Automated Response based on Intent
 */
export function getSmartResponse(intent: PatientIntent): string | null {
  if (intent.category === 'symptom_emergency') {
    return "I'm sorry to hear you're in pain. I've immediately flagged this to our medical team. A staff member will call you shortly to prioritize your care. 🚑";
  }
  
  if (intent.category === 'billing') {
    return "We understand that budget is important. We offer several flexible payment plans for our high-ticket treatments. Would you like a staff member to reach out and explain our options? 💳";
  }

  return null;
}
