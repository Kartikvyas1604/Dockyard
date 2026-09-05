import type { FeeIntelPayload } from "../types";

/**
 * Deterministic sample payloads for offline development and unit tests.
 * NEVER wired into the demo judging path — the demo must hit live Graph data.
 */

export const sampleIntel: FeeIntelPayload = {
  asOf: "2026-09-05T12:00:00Z",
  sources: [
    {
      protocol: "uniswap-v3",
      subgraph: "messari/uniswap-v3-ethereum",
      feeUsd24h: 412_884,
      volumeUsd24h: 486_920_112,
    },
    {
      protocol: "curve",
      subgraph: "messari/curve-ethereum",
      feeUsd24h: 38_210,
      volumeUsd24h: 141_005_330,
    },
  ],
  recommendation: {
    programKind: "XYCConcentrate",
    feeBps: 30,
    tickLower: -600,
    tickUpper: 600,
    rationale: "Concentrated range around current price; 30 bps sits under Uniswap's 0.3% tier where the pair clears most volume.",
  },
  graphQueryIds: ["sample-1", "sample-2"],
};
