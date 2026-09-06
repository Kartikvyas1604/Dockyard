/**
 * Tiny TTL cache for intel payloads. Keyed on (route, base, quote, lookback).
 * Keeps Graph panel refresh <3s perceived and absorbs FeeMirror polling
 * without hammering Subgraph Studio. Same KV-swap note as rate-limit.
 */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();
const MAX_ENTRIES = 200;

export function cacheKey(parts: (string | number)[]): string {
  return parts.map((p) => String(p).toLowerCase()).join("|");
}

export function cacheGet<T>(k: string): T | null {
  const e = store.get(k) as Entry<T> | undefined;
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(k);
    return null;
  }
  return e.value;
}

export function cacheSet<T>(k: string, value: T, ttlMs: number): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(k, { value, expiresAt: Date.now() + ttlMs });
}

/** For tests. */
export function resetCache(): void {
  store.clear();
}
