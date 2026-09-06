/**
 * Blocky402 facilitator client (Hedera testnet).
 * Wire contract: POST {payment} → { verified, settled, txHash?, reason? }
 * Facilitator URL + operator id come from validated server env.
 * All failures are fail-closed: unverified payments never mint intel.
 */

export type FacilitatorDecision =
  | { verified: true; settled: true; txHash?: string }
  | { verified: false; settled: false; reason: string };

function facilitatorBase(): string | null {
  const url = process.env.X402_FACILITATOR_URL;
  return url && url.length > 0 ? url.replace(/\/$/, "") : null;
}

export function paymentRequirements(resource: string) {
  const hbar = Number(process.env.INTEL_PRICE_HBAR ?? "0.05");
  return {
    scheme: "exact",
    network: process.env.HEDERA_NETWORK ?? "testnet",
    maxAmountRequired: String(Math.round(hbar * 1e8)), // tinybars
    resource,
    description: "Dockyard Strategy Intel — 24h standardized DEX fee/volume + params",
    mimeType: "application/json",
    payTo: process.env.HEDERA_OPERATOR_ID ?? "",
    asset: "HBAR",
    maxTimeoutSeconds: 60,
  };
}

/** Verify + settle an X-PAYMENT header via the facilitator. 8s budget. */
export async function verifyPayment(
  paymentHeader: string,
  resource: string,
): Promise<FacilitatorDecision> {
  const base = facilitatorBase();
  if (!base) return { verified: false, settled: false, reason: "facilitator_not_configured" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${base}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment: paymentHeader, resource }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { verified: false, settled: false, reason: `facilitator_http_${res.status}` };
    }
    const json = (await res.json()) as {
      verified?: boolean;
      settled?: boolean;
      txHash?: string;
      reason?: string;
    };
    if (json.verified && json.settled) {
      return { verified: true, settled: true, txHash: json.txHash };
    }
    return {
      verified: false,
      settled: false,
      reason: json.reason ?? "payment_not_settled",
    };
  } catch (e) {
    return {
      verified: false,
      settled: false,
      reason: e instanceof Error && e.name === "AbortError" ? "facilitator_timeout" : "facilitator_unreachable",
    };
  } finally {
    clearTimeout(t);
  }
}
