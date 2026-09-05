/**
 * Shared request/response types for Dockyard services.
 * Consumed by the web app, the intel API routes, and agent scripts.
 */

export type ProgramKind = "XYCConcentrate" | "XYC";

export type SuggestedBy = "manual" | "graph" | "x402";

export type FeeIntelSource = {
  protocol: string;
  subgraph: string;
  feeUsd24h: number;
  volumeUsd24h: number;
};

export type FeeIntelPayload = {
  asOf: string;
  sources: FeeIntelSource[];
  recommendation: {
    programKind: ProgramKind;
    feeBps: number;
    tickLower?: number;
    tickUpper?: number;
    rationale: string;
  };
  graphQueryIds: string[];
};

export type FeeIntelRequest = {
  base: string;
  quote: string;
  lookbackHours: number;
};

/** x402 lifecycle states surfaced in the Pay Intel stepper. */
export type IntelStep = "idle" | "402" | "paying" | "settled" | "applied" | "failed";

export type IntelErrorResponse = {
  error: "payment_required";
  x402: {
    version: 1;
    accepts: {
      scheme: string;
      network: string;
      maxAmountRequired: string;
      resource: string;
      description: string;
      mimeType: string;
      payTo: string;
      asset: string;
      maxTimeoutSeconds: number;
    }[];
  };
};

export type ApiError = {
  error: string;
  message: string;
};

export function isFeeIntelPayload(v: unknown): v is FeeIntelPayload {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Partial<FeeIntelPayload>;
  return (
    typeof p.asOf === "string" &&
    Array.isArray(p.sources) &&
    typeof p.recommendation === "object" &&
    p.recommendation !== null
  );
}
