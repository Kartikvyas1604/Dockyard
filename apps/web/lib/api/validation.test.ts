import { describe, expect, it } from "vitest";
import { parseIntelBody, parseIntelQuery, feeIntelRequestSchema } from "./validation";

describe("intel request validation", () => {
  it("accepts symbols and addresses", () => {
    expect(parseIntelBody({ base: "WETH", quote: "USDC" }).ok).toBe(true);
    expect(
      parseIntelBody({ base: "0x" + "a".repeat(40), quote: "USDC", lookbackHours: "48" }).ok,
    ).toBe(true);
  });

  it("defaults lookback to 24h", () => {
    const r = feeIntelRequestSchema.parse({ base: "WETH", quote: "USDC" });
    expect(r.lookbackHours).toBe(24);
  });

  it("rejects bad addresses, wrong case symbols, out-of-range lookback", () => {
    expect(parseIntelBody({ base: "0x123", quote: "USDC" }).ok).toBe(false);
    expect(parseIntelBody({ base: "weth", quote: "USDC" }).ok).toBe(false);
    expect(parseIntelBody({ base: "WETH", quote: "USDC", lookbackHours: 999 }).ok).toBe(false);
  });

  it("strips unknown fields (strict)", () => {
    const r = parseIntelBody({ base: "WETH", quote: "USDC", hack: "x" });
    expect(r.ok).toBe(false);
  });

  it("parses GET query", () => {
    const q = new URLSearchParams({ base: "WETH", quote: "USDC", lookbackHours: "12" });
    const r = parseIntelQuery(q);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.lookbackHours).toBe(12);
  });
});
