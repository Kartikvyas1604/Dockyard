import { describe, expect, it } from "vitest";
import { composeFeeSnapshots, scoreToRecommendation, type StandardizedSnapshot } from "./client";

describe("composeFeeSnapshots", () => {
  it("returns empty array when no deployments answer", async () => {
    const snaps = await composeFeeSnapshots(["https://invalid.invalid/subgraph"], {
      timeoutMs: 300,
    });
    expect(snaps).toEqual([]);
  });

  it("caps fan-out at 8 urls", async () => {
    const urls = Array.from({ length: 12 }, (_, i) => `https://invalid.invalid/${i}`);
    const started = Date.now();
    await composeFeeSnapshots(urls, { timeoutMs: 300 });
    // 8 urls x (2 attempts x 300ms) + 300ms backoff ~= bounded, not 12 x
    expect(Date.now() - started).toBeLessThan(8000);
  });
});

describe("scoreToRecommendation", () => {
  const snaps: StandardizedSnapshot[] = [
    { protocol: "uniswap-v3", subgraph: "u", feeUsd24h: 250_000, volumeUsd24h: 400_000_000 },
    { protocol: "curve", subgraph: "c", feeUsd24h: 250_000, volumeUsd24h: 50_000_000 },
  ];

  it("recommends standard 30bps when fees are dispersed", () => {
    const rec = scoreToRecommendation(snaps);
    expect(rec.programKind).toBe("XYCConcentrate");
    expect(rec.feeBps).toBe(30);
    expect(rec.tickLower).toBe(-600);
    expect(rec.tickUpper).toBe(600);
  });

  it("tightens band when one venue dominates fees", () => {
    const dominated: StandardizedSnapshot[] = [
      { protocol: "uniswap-v3", subgraph: "u", feeUsd24h: 900_000, volumeUsd24h: 400_000_000 },
      { protocol: "curve", subgraph: "c", feeUsd24h: 10_000, volumeUsd24h: 200_000_000 },
    ];
    const rec = scoreToRecommendation(dominated);
    expect(rec.tickLower).toBe(-300);
    expect(rec.tickUpper).toBe(300);
  });

  it("handles empty input without throwing", () => {
    const rec = scoreToRecommendation([]);
    expect(rec.programKind).toBe("XYCConcentrate");
    expect(rec.rationale).toContain("0 standardized");
  });
});
