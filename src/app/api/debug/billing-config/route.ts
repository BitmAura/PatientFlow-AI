import { NextResponse } from 'next/server'
import { resolveRazorpayPlanId } from '@/lib/razorpay/subscriptions'

// Temporary debug endpoint to check Razorpay configuration.
// Returns booleans for presence of keys and resolved plan IDs (no secrets).
export async function GET(request: Request) {
  try {
    // Optional header protection: set DEBUG_SECRET in env and include header 'x-debug-secret' to access
    const secret = process.env.DEBUG_SECRET?.trim()
    if (secret) {
      const provided = request.headers.get('x-debug-secret') || ''
      if (provided !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const hasKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

    const checks: Record<string, { ok: boolean; value?: string; error?: string }> = {}

    const planChecks = [
      { key: 'starter_monthly', plan: 'starter', cycle: 'monthly' },
      { key: 'growth_monthly', plan: 'growth', cycle: 'monthly' },
      { key: 'annual', plan: 'pro', cycle: 'annual' },
    ]

    for (const p of planChecks) {
      try {
        const resolved = resolveRazorpayPlanId(p.plan as any, p.cycle as any)
        checks[p.key] = { ok: true, value: resolved }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        checks[p.key] = { ok: false, error: message }
      }
    }

    return NextResponse.json({ hasKeys, checks })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Debug billing-config error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
