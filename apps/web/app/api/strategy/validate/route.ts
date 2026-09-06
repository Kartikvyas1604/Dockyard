import { errorResponse, ok } from "@/lib/api/errors";
import { requestIdFrom } from "@/lib/api/request";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { serverEnv } from "@/lib/api/env";
import { allowanceGuidance, strategyHash, strategyDraftSchema, type StrategyDraft } from "@/lib/aqua/strategy";

/**
 * POST /api/strategy/validate — server-side ship-draft validation.
 * Stateless + custody-free: validates params, derives strategyHash,
 * returns exact-allowance guidance. The wallet still signs ship();
 * this endpoint never touches keys or tokens.
 */
export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  const env = serverEnv();

  const limit = checkRateLimit(req, "strategy-validate", env.INTEL_RATE_LIMIT_PER_MIN * 2);
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Too many validation requests.", requestId, {
      status: 429,
      headers: { "retry-after": String(limit.retryAfterSec) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("bad_request", "Request body must be valid JSON.", requestId);
  }

  const parsed = strategyDraftSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("bad_request", "Invalid strategy draft.", requestId, {
      details: parsed.error.issues,
    });
  }

  const draft: StrategyDraft = parsed.data;
  return ok(
    {
      valid: true,
      strategyHash: strategyHash(draft),
      contracts: {
        aquaRouter: "0x1111113ccf1426a8e30e2bff5e005d929bf6a90a",
        aquaSwapVMRouter: "0x111111338c5091e8440b67b168bae16a668ac0de",
      },
      allowance: allowanceGuidance(draft.notional),
      risk: "Impermanent loss applies. Underfunded strategies stop filling. Approval risk: approve exact amounts only.",
    },
    requestId,
  );
}
