/**
 * Patient Reliability Index (PRI) & Lead Scoring
 * 🤖 Activated by: agency-ai-engineer
 */

export interface ScoringInput {
  history: {
    total_appointments: number
    no_show_count: number
    completed_count: number
  }
  treatment_category?: string
  treatment_tier?: 'tier_1' | 'tier_2' | 'tier_3'
  last_visit_date: string | Date
}

export function calculatePatientScore(input: ScoringInput): number {
  let score = 40 // Base score (Reduced to make room for tier multipliers)

  // 1. Reliability (Historical Conversion)
  if (input.history.total_appointments > 0) {
    const successRate = input.history.completed_count / input.history.total_appointments
    const noShowPenalty = (input.history.no_show_count / input.history.total_appointments) * 50
    score += successRate * 25
    score -= noShowPenalty
  }

  // 2. Financial Tier Multiplier (The "Founder Advantage")
  // Priority logic for high-ticket dental vs routine
  const tierWeights: Record<string, number> = {
    'tier_1': 60, // Implants, Ortho, Aesthetic
    'tier_2': 30, // RCT, Crowns
    'tier_3': 5,  // Cleanings, Fillings
  }

  if (input.treatment_tier && tierWeights[input.treatment_tier]) {
    score += tierWeights[input.treatment_tier]
  } else {
    // Fallback if tier not explicitly set
    const categoryWeights: Record<string, number> = {
      'implant': 50,
      'ortho': 45,
      'root_canal': 25,
      'cleaning': 5
    }
    if (input.treatment_category && categoryWeights[input.treatment_category]) {
      score += categoryWeights[input.treatment_category]
    }
  }

  // 3. Recency Decay
  const daysSinceLastVisit = Math.floor(
    (Date.now() - new Date(input.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceLastVisit > 365) score -= 15
  else if (daysSinceLastVisit > 180) score -= 5

  return Math.max(score, 0) // No upper clamp - high-ticket should dominate
}
