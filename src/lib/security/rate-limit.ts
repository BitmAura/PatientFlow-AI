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

// Warn in serverless environments: in-memory counters are per-instance and
// do not provide a global distributed rate limit. Use Redis/Upstash or another
// shared store for production deployments behind multiple instances.
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_WORKER_RUNTIME)
if (IS_SERVERLESS) {
  // eslint-disable-next-line no-console
  console.warn('[RateLimit] Using in-memory rate limiter in serverless environment — this is not globally reliable. Consider using a distributed store (Redis/Upstash).')
}

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

// Async variant: if Upstash/Redis is configured, use it for distributed limiting.
// Falls back to the in-memory limiter when no Redis/Upstash config is present or on error.
export async function checkRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL_RAW
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN_RAW || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!upstashUrl || !upstashToken) {
    return checkRateLimit(key, limit, windowMs)
  }

  try {
    const headers = {
      Authorization: `Bearer ${upstashToken}`,
      'Content-Type': 'application/json',
    }

    // 1) Increment
    const incrRes = await fetch(`${upstashUrl}/commands`, {
      method: 'POST',
      headers,
      body: JSON.stringify(['incr', key]),
    })
    const incrJson = await incrRes.json()
    const count = Number(incrJson.result ?? incrJson)

    // 2) Ensure TTL is set on first increment
    const pttlRes = await fetch(`${upstashUrl}/commands`, {
      method: 'POST',
      headers,
      body: JSON.stringify(['pttl', key]),
    })
    const pttlJson = await pttlRes.json()
    let ttl = Number(pttlJson.result ?? pttlJson)
    if (!Number.isFinite(ttl)) ttl = -1

    if (ttl < 0) {
      // Set expiry in milliseconds
      await fetch(`${upstashUrl}/commands`, {
        method: 'POST',
        headers,
        body: JSON.stringify(['pexpire', key, windowMs]),
      })
      ttl = windowMs
    }

    if (count > limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil(ttl / 1000))
      return { allowed: false, remaining: 0, retryAfterSeconds }
    }

    const remaining = Math.max(0, limit - count)
    const retryAfterSeconds = Math.max(1, Math.ceil(ttl / 1000))
    return { allowed: true, remaining, retryAfterSeconds }
  } catch (err) {
    // On any error, fall back to local in-memory limiter
    // eslint-disable-next-line no-console
    console.warn('[RateLimit] Upstash check failed, falling back to in-memory limiter:', err)
    return checkRateLimit(key, limit, windowMs)
  }
}
