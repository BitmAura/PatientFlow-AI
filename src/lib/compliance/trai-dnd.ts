/**
 * TRAI DND Compliance Utility
 * 🧬 Persona: Compliance Officer
 * ⚡ Purpose: Prevents marketing messages from being sent to numbers on India's DND registry.
 */

interface DndResult {
  isDnd: boolean
  provider?: string
  lastCheckedAt: string
}

/**
 * Checks if a phone number is registered in the TRAI DND (Do Not Disturb) registry.
 * In a production environment, this would call an official aggregator like 2Factor, 
 * MSG91, or the Gupshup DND API.
 */
export async function checkDndStatus(phone: string): Promise<DndResult> {
  const cleanPhone = phone.replace(/\D/g, '')
  
  // LOGIC: In this mock, we block a few hardcoded numbers or ranges for testing,
  // or return false by default for demo purposes.
  // Real implementation:
  // const res = await fetch(`https://api.aggregator.com/check-dnd?phone=${cleanPhone}&token=${process.env.DND_API_KEY}`)
  // const data = await res.json()
  // return { isDnd: data.is_dnd, ... }

  console.log(`[DND] Checking TRAI compliance for ${cleanPhone}...`)

  // Mock: Block numbers ending in '000' for demo visibility
  const isDemoBlocked = cleanPhone.endsWith('000')

  return {
    isDnd: isDemoBlocked,
    provider: 'Mock DND Registry',
    lastCheckedAt: new Date().toISOString()
  }
}
