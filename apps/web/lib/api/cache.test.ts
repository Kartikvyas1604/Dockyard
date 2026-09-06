import { describe, expect, it, beforeEach } from "vitest";
import { cacheGet, cacheSet, cacheKey, resetCache } from "./cache";

beforeEach(() => resetCache());

describe("cache", () => {
  it("round-trips a value within TTL", () => {
    const k = cacheKey(["preview", "WETH", "USDC", 24]);
    cacheSet(k, { a: 1 }, 1000);
    expect(cacheGet<{ a: number }>(k)).toEqual({ a: 1 });
  });

  it("misses after expiry", () => {
    const k = cacheKey(["preview", "WETH", "USDC", 24]);
    cacheSet(k, { a: 1 }, -1);
    expect(cacheGet(k)).toBeNull();
  });

  it("evicts oldest beyond 200 entries", () => {
    for (let i = 0; i < 201; i++) cacheSet(`k${i}`, i, 60_000);
    expect(cacheGet("k0")).toBeNull();
    expect(cacheGet("k200")).toBe(200);
  });
});
