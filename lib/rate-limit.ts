/**
 * Minimal in-memory rate limiter — fixed window per key (typically an IP).
 *
 * Caveat: this state lives in the memory of a single server instance. On
 * serverless platforms (Netlify Functions, Vercel, etc.) each cold start
 * gets a fresh instance, and traffic can be spread across several warm
 * instances at once — so this is a "slow down casual abuse" limiter, not a
 * hard guarantee. For a strict global limit, back this with a shared store
 * (e.g. Upstash Redis) instead.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    pruneExpired(now);
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

// Opportunistic cleanup so the map doesn't grow forever between requests.
function pruneExpired(now: number) {
  if (buckets.size < 500) return; // only bother once it's grown a bit
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Best-effort client identifier from standard proxy headers. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
