/**
 * Blocky402 facilitator client (Hedera testnet).
 * Wire format: x402 v2 — separate /verify then /settle calls.
 *   POST /verify  → { isValid, invalidReason? }
 *   POST /settle  → { success, transaction, errorReason? }
 * Base URL: https://api.testnet.blocky402.com (open access, no API key).
 * Hedera payments require extra.feePayer = the facilitator's advertised
 * fee-payer (GET /supported); override via X402_FEE_PAYER.
 * All failures are fail-closed: unverified payments never mint intel.
 */

export type FacilitatorDecision =
  | { verified: true; settled: true; txHash?: string }
  | { verified: true; settled: false; reason: string }
  | { verified: false; settled: false; reason: string };

function facilitatorBase(): string | null {
  const url = process.env.X402_FACILITATOR_URL;
  return url && url.length > 0 ? url.replace(/\/$/, "") : null;
}

export function hederaNetwork(): string {
  return process.env.HEDERA_NETWORK === "mainnet" ? "hedera:mainnet" : "hedera:testnet";
}

function priceTinybars(): string {
  const hbar = Number(process.env.INTEL_PRICE_HBAR ?? "0.05");
  return String(Math.round(hbar * 1e8));
}

/** Fee-payer advertised by the facilitator (cached 5 min). Env override wins. */
let feePayerCache: { value: string | null; at: number } = { value: null, at: 0 };

async function resolveFeePayer(base: string): Promise<string | null> {
  const envPayer = process.env.X402_FEE_PAYER;
  if (envPayer) return envPayer;
  if (Date.now() - feePayerCache.at < 5 * 60 * 1000) return feePayerCache.value;
  try {
    const res = await fetch(`${base}/supported`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as {
      kinds?: { scheme: string; network: string; extra?: { feePayer?: string } }[];
    };
    const hedera = json.kinds?.find((k) => k.scheme === "exact" && k.network.startsWith("hedera:"));
    feePayerCache = { value: hedera?.extra?.feePayer ?? null, at: Date.now() };
  } catch {
    feePayerCache = { value: null, at: Date.now() };
  }
  return feePayerCache.value;
}

export async function paymentRequirements(resource: string) {
  const base = facilitatorBase();
  const feePayer = base ? await resolveFeePayer(base) : null;
  return {
    scheme: "exact",
    network: hederaNetwork(),
    amount: priceTinybars(), // tinybars base units (v2 field name)
    resource,
    description: "Dockyard Strategy Intel — 24h standardized DEX fee/volume + params",
    mimeType: "application/json",
    payTo: process.env.HEDERA_OPERATOR_ID ?? "",
    asset: "0.0.0", // HBAR
    maxTimeoutSeconds: 60,
    ...(feePayer ? { extra: { feePayer } } : {}),
  };
}

/**
 * Verify + settle an X-PAYMENT header via the facilitator.
 * The X-PAYMENT header (base64 x402 v2 paymentPayload) is forwarded as-is;
 * the body carries the resource's paymentRequirements. 8s budget per call.
 */
export async function verifyPayment(
  paymentHeader: string,
  resource: string,
): Promise<FacilitatorDecision> {
  const base = facilitatorBase();
  if (!base) return { verified: false, settled: false, reason: "facilitator_not_configured" };
  const requirements = await paymentRequirements(resource);
  const init = {
    method: "POST" as const,
    headers: { "Content-Type": "application/json", "X-PAYMENT": paymentHeader },
    body: JSON.stringify({ paymentRequirements: requirements }),
  };

  // 1. Verify
  let verifyJson: { isValid?: boolean; invalidReason?: string; invalidMessage?: string };
  try {
    const res = await fetch(`${base}/verify`, { ...init, signal: AbortSignal.timeout(8000) });
    verifyJson = (await res.json()) as typeof verifyJson;
  } catch (e) {
    return {
      verified: false,
      settled: false,
      reason: e instanceof Error && e.name === "AbortError" ? "facilitator_timeout" : "facilitator_unreachable",
    };
  }
  if (!verifyJson.isValid) {
    return {
      verified: false,
      settled: false,
      reason: verifyJson.invalidReason ?? verifyJson.invalidMessage ?? "payment_invalid",
    };
  }

  // 2. Settle
  let settleJson: { success?: boolean; transaction?: string; errorReason?: string; errorMessage?: string };
  try {
    const res = await fetch(`${base}/settle`, { ...init, signal: AbortSignal.timeout(15000) });
    settleJson = (await res.json()) as typeof settleJson;
  } catch (e) {
    return {
      verified: true,
      settled: false,
      reason: e instanceof Error && e.name === "AbortError" ? "facilitator_timeout" : "facilitator_unreachable",
    };
  }
  if (!settleJson.success) {
    return {
      verified: true,
      settled: false,
      reason: settleJson.errorReason ?? settleJson.errorMessage ?? "payment_not_settled",
    };
  }
  return { verified: true, settled: true, txHash: settleJson.transaction };
}
