import type { FeeIntelPayload } from "@dockyard/api";
import { cacheGet, cacheKey, cacheSet } from "@/lib/api/cache";
import { serverEnv, graphUrls, isGraphConfigured, isX402Configured } from "@/lib/api/env";
import { errorResponse, ok } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { log, requestIdFrom } from "@/lib/api/request";
import { parseIntelBody, parseIntelQuery } from "@/lib/api/validation";
import { composeFeeSnapshots, scoreToRecommendation } from "@/lib/graph/client";
import { paymentRequirements, verifyPayment } from "@/lib/x402/facilitator";
import { getReceipt, putReceipt } from "@/lib/x402/receipts";

/**
 * x402-gated Strategy Intel (Hedera testnet via Blocky402 facilitator).
 *
 *   GET/POST without X-PAYMENT → 402 + payment requirements
 *   GET/POST with X-PAYMENT   → verify/settle → 200 intel payload
 *
 * Fail-closed throughout: unverified payments never mint intel.
 * Idempotent: retrying with the same X-PAYMENT returns the cached receipt.
 * Same payload shape as /api/intel/preview — Apply-to-ship works either way.
 */

function requirements402(requestId: string) {
  return errorResponse("payment_required", "Payment required: complete x402 settlement and retry with X-PAYMENT.", requestId, {
    status: 402,
    extra: { x402: { version: 1, accepts: [paymentRequirements("/api/intel")] } },
  });
}

async function paidIntel(
  req: Request,
  input: { base: string; quote: string; lookbackHours: number },
  requestId: string,
) {
  const env = serverEnv();
  const payment = req.headers.get("x-payment");

  if (!isX402Configured()) {
    return errorResponse(
      "not_configured",
      "x402 facilitator not configured (X402_FACILITATOR_URL, HEDERA_OPERATOR_ID). The 402 flow below is the wire contract.",
      requestId,
    );
  }
  if (!payment) return requirements402(requestId);

  // Idempotency: same payment header → same payload, no double settle.
  const receipt = getReceipt(payment);
  if (receipt) {
    log("info", "intel.paid.idempotent_hit", { req: requestId });
    return ok({ ...receipt.payload, receipt: { reused: true, txHash: receipt.txHash } }, requestId);
  }

  const decision = await verifyPayment(payment, "/api/intel");
  if (!decision.verified || !decision.settled) {
    log("warn", "intel.paid.unverified", { req: requestId, reason: decision.reason });
    return errorResponse("payment_unverified", `Payment not settled: ${decision.reason}.`, requestId, {
      status: 402,
      extra: { x402: { version: 1, accepts: [paymentRequirements("/api/intel")] } },
    });
  }

  if (!isGraphConfigured()) {
    return errorResponse("not_configured", "GRAPH_SUBGRAPH_URLS is not set — cannot compose intel after payment.", requestId);
  }

  const key = cacheKey(["paid", input.base, input.quote, input.lookbackHours, payment.slice(0, 16)]);
  const cached = cacheGet<FeeIntelPayload>(key);
  if (cached) {
    putReceipt(payment, cached, decision.txHash);
    return ok({ ...cached, receipt: { reused: true, txHash: decision.txHash } }, requestId);
  }

  try {
    const snaps = await composeFeeSnapshots(graphUrls(), {
      apiKey: env.GRAPH_API_KEY,
      lookbackHours: input.lookbackHours,
    });
    if (snaps.length === 0) {
      return errorResponse("no_data", "No standardized deployments answered in the lookback window.", requestId);
    }
    const payload: FeeIntelPayload = {
      asOf: new Date().toISOString(),
      sources: snaps,
      recommendation: scoreToRecommendation(snaps),
      graphQueryIds: snaps.map((s) => s.subgraph),
    };
    cacheSet(key, payload, env.INTEL_CACHE_TTL_MS);
    putReceipt(payment, payload, decision.txHash);
    log("info", "intel.paid.ok", { req: requestId, sources: snaps.length, tx: decision.txHash });
    return ok({ ...payload, receipt: { reused: false, txHash: decision.txHash } }, requestId);
  } catch (e) {
    log("error", "intel.paid.upstream", { req: requestId, err: e instanceof Error ? e.message : String(e) });
    return errorResponse("upstream", e instanceof Error ? e.message : "Graph query failed", requestId);
  }
}

function guardRate(req: Request, requestId: string, env: ReturnType<typeof serverEnv>) {
  const limit = checkRateLimit(req, "intel", env.INTEL_RATE_LIMIT_PER_MIN);
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Too many intel requests — slow down and retry.", requestId, {
      status: 429,
      headers: { "retry-after": String(limit.retryAfterSec) },
    });
  }
  return null;
}

export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  const env = serverEnv();
  const limited = guardRate(req, requestId, env);
  if (limited) return limited;

  let body: unknown = null;
  try {
    body = await req.json().catch(() => null);
  } catch {
    return errorResponse("bad_request", "Request body must be valid JSON.", requestId);
  }
  // Empty body on the paid path defaults to WETH/USDC 24h so the Pay
  // stepper can settle without a form round-trip; explicit bodies validate.
  const parsed = body === null ? parseIntelBody({ base: "WETH", quote: "USDC", lookbackHours: 24 }) : parseIntelBody(body);
  if (!parsed.ok) {
    return errorResponse("bad_request", "Invalid intel request.", requestId, { details: parsed.issues });
  }
  return paidIntel(req, parsed.value, requestId);
}

export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  const env = serverEnv();
  const limited = guardRate(req, requestId, env);
  if (limited) return limited;

  const parsed = parseIntelQuery(new URL(req.url).searchParams);
  if (!parsed.ok) {
    // No/invalid query → still return the 402 contract when unpaid so
    // agents discover payment requirements with a bare GET.
    const payment = req.headers.get("x-payment");
    if (!payment) {
      if (!isX402Configured()) {
        return errorResponse("not_configured", "x402 facilitator not configured.", requestId);
      }
      return requirements402(requestId);
    }
    return errorResponse("bad_request", "Invalid intel query: base and quote are required.", requestId, {
      details: parsed.issues,
    });
  }
  return paidIntel(req, parsed.value, requestId);
}
