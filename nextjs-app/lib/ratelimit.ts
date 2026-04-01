/**
 * Simple in-memory rate limiter for the API route.
 * Limits each IP to `max` requests per `windowMs`.
 *
 * For production with multiple server instances, swap the Map for Redis.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export interface RateLimitOptions {
  /** Time window in milliseconds. Default: 60_000 (1 min) */
  windowMs?: number;
  /** Max requests per window per IP. Default: 20 */
  max?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  { windowMs = 60_000, max = 20 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  return { allowed: entry.count <= max, remaining, resetAt: entry.resetAt };
}
