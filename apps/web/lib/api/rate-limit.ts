/**
 * Minimal in-memory sliding-window rate limiter for App Router routes.
 * Single-instance scope (fine for MVP/Vercel hobby + fork demo).
 * For multi-instance prod, swap the Map for Upstash/Vercel KV behind
 * the same `checkRateLimit` signature — routes don't change.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

function key(ip: string, route: string): string {
  return `${route}:${ip}`;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

/**
 * Sliding window. Returns null when allowed, or retryAfterSec when limited.
 * Mutates the bucket only when allowed (no counter growth on rejects).
 */
export function checkRateLimit(
  req: Request,
  route: string,
  limitPerMin: number,
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const k = key(clientIp(req), route);
  const bucket = buckets.get(k) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limitPerMin) {
    const oldest = bucket.hits[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(k, bucket);
    return { allowed: false, retryAfterSec };
  }
  bucket.hits.push(now);
  buckets.set(k, bucket);
  return { allowed: true };
}

/** For tests. */
export function resetRateLimits(): void {
  buckets.clear();
}
