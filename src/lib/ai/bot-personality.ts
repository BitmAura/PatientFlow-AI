/**
 * WhatsApp Bot Personality Engine
 * 🤖 Activated by: AI Engineer & CEO/Founder
 */

export interface ToneResult {
  prefix: string
  suffix: string
  styleDescription: string
  recommendEmojis: boolean
}

export type BotPersonality = 'professional' | 'friendly' | 'direct'

export function getBotPersonalityTone(personality: BotPersonality, botName: string = 'Aura AI'): ToneResult {
  switch (personality) {
    case 'friendly':
      return {
        prefix: `Hey there! 👋 This is ${botName} from the team at`,
        suffix: "We can't wait to see you back at the clinic! Let us know if you have any questions. Warmly,",
        styleDescription: 'Warm, conversational, and caring.',
        recommendEmojis: true
      }
    case 'direct':
      return {
        prefix: `RECALL NOTICE: ${botName} speaking for`,
        suffix: 'Reply to this message to confirm your appointment. Thank you.',
        styleDescription: 'Concise, efficient, and professional.',
        recommendEmojis: false
      }
    case 'professional':
    default:
      return {
        prefix: `Good morning/afternoon, this is ${botName} representing`,
        suffix: 'We appreciate your commitment to your oral health. Regards,',
        styleDescription: 'Formal, precise, and authoritative.',
        recommendEmojis: false
      }
  }
}

/**
 * Apply Tone to Message
 * (Basic string transformation for now)
 */
export function applyBotTone(content: string, personality: BotPersonality, clinicName: string, botName: string): string {
  const tone = getBotPersonalityTone(personality, botName)
  let result = `${tone.prefix} ${clinicName}.\n\n${content}\n\n${tone.suffix}`
  
  if (!tone.recommendEmojis) {
    // Basic emoji removal logic if Direct/Professional
    result = result.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
  }

  return result
}
