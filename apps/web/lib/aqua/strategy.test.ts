import { describe, expect, it } from "vitest";
import {
  strategyHash,
  strategyDraftSchema,
  allowanceGuidance,
  AQUA_ROUTER,
} from "./strategy";

const valid = {
  programKind: "XYCConcentrate" as const,
  tokenIn: "0x" + "a".repeat(40),
  tokenOut: "0x" + "b".repeat(40),
  feeBps: 30,
  tickLower: -600,
  tickUpper: 600,
  notional: "1250.00",
  chainId: 1,
};

describe("strategy draft", () => {
  it("accepts a valid concentrated draft", () => {
    expect(strategyDraftSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects identical tokens", () => {
    const bad = { ...valid, tokenOut: valid.tokenIn };
    expect(strategyDraftSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects inverted tick range", () => {
    expect(strategyDraftSchema.safeParse({ ...valid, tickLower: 600, tickUpper: -600 }).success).toBe(false);
  });

  it("requires ticks for XYCConcentrate", () => {
    const noTicks = { ...valid } as Partial<typeof valid>;
    delete noTicks.tickLower;
    delete noTicks.tickUpper;
    expect(strategyDraftSchema.safeParse(noTicks).success).toBe(false);
  });

  it("rejects zero/negative notional and non-decimal strings", () => {
    expect(strategyDraftSchema.safeParse({ ...valid, notional: "0" }).success).toBe(false);
    expect(strategyDraftSchema.safeParse({ ...valid, notional: "-5" }).success).toBe(false);
    expect(strategyDraftSchema.safeParse({ ...valid, notional: "1e6" }).success).toBe(false);
  });

  it("produces a stable 32-byte strategy hash", () => {
    const h1 = strategyHash(strategyDraftSchema.parse(valid));
    const h2 = strategyHash(strategyDraftSchema.parse({ ...valid }));
    expect(h1).toMatch(/^0x[0-9a-f]{64}$/);
    expect(h1).toBe(h2);
  });

  it("hash changes when params change", () => {
    const h1 = strategyHash(strategyDraftSchema.parse(valid));
    const h2 = strategyHash(strategyDraftSchema.parse({ ...valid, feeBps: 10 }));
    expect(h1).not.toBe(h2);
  });

  it("always recommends exact allowance", () => {
    const g = allowanceGuidance("1250.00");
    expect(g.mode).toBe("exact");
    expect(g.warning).toContain(AQUA_ROUTER);
  });
});
