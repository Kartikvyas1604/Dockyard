import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rate-limit";

function req(ip = "1.2.3.4"): Request {
  return new Request("https://dockyard.test/api/intel", {
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => resetRateLimits());

describe("rate limit", () => {
  it("allows under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req(), "t", 5).allowed).toBe(true);
    }
  });

  it("blocks over the limit with retry-after", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(req(), "t", 5);
    const r = checkRateLimit(req(), "t", 5);
    expect(r.allowed).toBe(false);
    if (!r.allowed) expect(r.retryAfterSec).toBeGreaterThanOrEqual(1);
  });

  it("isolates buckets per ip + route", () => {
    for (let i = 0; i < 5; i++) checkRateLimit(req("9.9.9.9"), "t", 5);
    expect(checkRateLimit(req("8.8.8.8"), "t", 5).allowed).toBe(true);
    expect(checkRateLimit(req("9.9.9.9"), "other", 5).allowed).toBe(true);
  });
});
