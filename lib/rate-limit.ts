import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

interface RateLimitState {
  date: string
  count: number
}

// Global in-memory counter state for local development or Redis fallback
const memoryState: RateLimitState = {
  date: "",
  count: 0,
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  error?: string
}

/**
 * Checks whether rate limiting feature flag is enabled via ENABLE_MAX_REQUEST_PER_DAY.
 * Defaults to false if not explicitly set to "true".
 */
export function isMapRateLimitEnabled(): boolean {
  return process.env.ENABLE_MAX_REQUEST_PER_DAY?.toLowerCase() === "true"
}

/**
 * Returns configured daily request limit from process.env.MAX_REQUEST_PER_DAY.
 * Defaults to 100 if undefined, empty, or invalid.
 */
export function getMapDailyLimit(): number {
  const raw = process.env.MAX_REQUEST_PER_DAY
  if (!raw) return 100
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) || parsed <= 0 ? 100 : parsed
}

// Lazy-instantiate Upstash Redis & Ratelimit if env vars exist
function getUpstashRatelimit(limit: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, "24h"),
    analytics: true,
    prefix: "ratelimit:map_api",
  })
}

/**
 * Checks and increments global daily request limit for Map / Places API requests.
 * Only enforces limits if ENABLE_MAX_REQUEST_PER_DAY=true.
 * Uses Upstash Redis when configured (for Vercel serverless environment),
 * with fallback to in-memory counter.
 */
export async function checkAndIncrementMapRateLimit(): Promise<RateLimitResult> {
  const enabled = isMapRateLimitEnabled()
  const limit = getMapDailyLimit()

  // If rate limiting feature flag is disabled, bypass limit check
  if (!enabled) {
    return {
      allowed: true,
      limit,
      remaining: limit,
    }
  }

  // 1. Try Upstash Redis rate limiting if credentials exist
  try {
    const ratelimit = getUpstashRatelimit(limit)
    if (ratelimit) {
      const { success, limit: max, remaining } = await ratelimit.limit("global_map_limit")
      if (!success) {
        return {
          allowed: false,
          limit: max,
          remaining: 0,
          error: "Daily limit exceeded for map requests. Please try again tomorrow.",
        }
      }
      return {
        allowed: true,
        limit: max,
        remaining,
      }
    }
  } catch (err) {
    console.error("[rate-limit] Upstash Redis check failed, falling back to in-memory:", err)
  }

  // 2. In-memory fallback (local development / missing Redis env)
  const currentDate = new Date().toISOString().split("T")[0]
  if (memoryState.date !== currentDate) {
    memoryState.date = currentDate
    memoryState.count = 0
  }

  if (memoryState.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      error: "Daily limit exceeded for map requests. Please try again tomorrow.",
    }
  }

  memoryState.count += 1
  return {
    allowed: true,
    limit,
    remaining: limit - memoryState.count,
  }
}
