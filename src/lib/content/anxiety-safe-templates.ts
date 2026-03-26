
// ==========================================
// ANXIETY-SAFE MESSAGING TEMPLATES
// ==========================================

export interface MessageTemplate {
  day_offset: number; // 0 = immediate when overdue, 2 = 2 days after first overdue check? No, day relative to overdue?
  // Let's say relative to "Start of Delay" or "Sequence Number"
  sequence_index: number; // 0 for first message, 1 for second
  content: string;
  type: 'educational' | 'reassurance' | 'check_in';
}

export const DENTAL_IMPLANT_TEMPLATES: Record<string, MessageTemplate[]> = {
  // Key matches the Stage Name or Type
  "Initial Consultation & CT Scan": [
    {
      sequence_index: 0,
      day_offset: 0,
      type: 'educational',
      content: "Hi {name}, Dr. Smith here. I know deciding on implants is big. Here is a short video on how we ensure a pain-free experience: [Link]. No rush, just wanted to share."
    },
    {
      sequence_index: 1,
      day_offset: 2, // 2 days after previous? Or 2 days total delay?
      type: 'reassurance',
      content: "Hi {name}, thought this might help—it's a story from Sarah, who had the same procedure last month. She mentions the recovery was much easier than expected! [Link]"
    }
  ],
  "Implant Placement Surgery": [
    {
      sequence_index: 0,
      day_offset: 0,
      type: 'check_in',
      content: "Hi {name}, hope you're feeling ready. We have a 'Comfort Menu' (music, blankets) for your surgery day. Let us know if you'd like to pick anything in advance!"
    }
  ]
};

export const HAIR_TRANSPLANT_TEMPLATES: Record<string, MessageTemplate[]> = {
  "Consultation": [
    {
      sequence_index: 0,
      day_offset: 0,
      type: 'educational',
      content: "Hi {name}, a lot of patients ask about the 'ugly duckling' phase. It's totally normal! Here's a timeline of what growth looks like month-by-month: [Link]"
    },
    {
      sequence_index: 1,
      day_offset: 2,
      type: 'reassurance',
      content: "Hi {name}, just checking in. If you have any specific worries about the procedure, feel free to reply here. We're here to help, not to push."
    }
  ]
};

export function getTemplateForStage(stageName: string, sequenceIndex: number, serviceType: 'dental' | 'hair' = 'dental'): MessageTemplate | null {
  const templates = serviceType === 'dental' ? DENTAL_IMPLANT_TEMPLATES : HAIR_TRANSPLANT_TEMPLATES;
  const stageTemplates = templates[stageName];
  
  if (!stageTemplates) return null;
  
  return stageTemplates.find(t => t.sequence_index === sequenceIndex) || null;
}
