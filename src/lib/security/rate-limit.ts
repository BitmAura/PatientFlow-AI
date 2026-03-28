type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

type CounterState = {
  count: number
  windowStart: number
}

const counters = new Map<string, CounterState>()

function cleanupExpired(windowMs: number, now: number) {
  for (const [key, state] of counters.entries()) {
    if (now - state.windowStart > windowMs * 2) {
      counters.delete(key)
    }
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp.trim()
  }

  return 'unknown'
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  cleanupExpired(windowMs, now)

  const existing = counters.get(key)
  if (!existing || now - existing.windowStart >= windowMs) {
    counters.set(key, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  if (existing.count >= limit) {
    const retryAfterMs = windowMs - (now - existing.windowStart)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  existing.count += 1
  counters.set(key, existing)

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.ceil((windowMs - (now - existing.windowStart)) / 1000),
  }
}
