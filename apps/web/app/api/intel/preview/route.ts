import type { FeeIntelPayload } from "@dockyard/api";
import { cacheGet, cacheKey, cacheSet } from "@/lib/api/cache";
import { serverEnv, graphUrls, isGraphConfigured } from "@/lib/api/env";
import { errorResponse, ok } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { log, requestIdFrom } from "@/lib/api/request";
import { parseIntelBody } from "@/lib/api/validation";
import { composeFeeSnapshots, scoreToRecommendation } from "@/lib/graph/client";

/**
 * POST /api/intel/preview — ungated iteration path.
 * Hardened: zod validation, per-IP rate limit, 30s TTL cache,
 * consistent error envelope, partial-success tolerant.
 */
export async function POST(req: Request) {
  const requestId = requestIdFrom(req);
  const env = serverEnv();

  const limit = checkRateLimit(req, "intel-preview", env.INTEL_RATE_LIMIT_PER_MIN);
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Too many preview requests — slow down and retry.", requestId, {
      status: 429,
      headers: { "retry-after": String(limit.retryAfterSec) },
    });
  }

  if (!isGraphConfigured()) {
    return errorResponse(
      "not_configured",
      "GRAPH_SUBGRAPH_URLS is not set. Add Messari standardized DEX deployment URLs — the panel shows an honest error, never mock data.",
      requestId,
    );
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return errorResponse("bad_request", "Request body must be valid JSON.", requestId);
  }
  const parsed = parseIntelBody(body);
  if (!parsed.ok) {
    return errorResponse("bad_request", "Invalid intel request.", requestId, { details: parsed.issues });
  }
  const { base, quote, lookbackHours } = parsed.value;

  const key = cacheKey(["preview", base, quote, lookbackHours]);
  const cached = cacheGet<FeeIntelPayload>(key);
  if (cached) {
    log("info", "intel.preview.cache_hit", { req: requestId, base, quote });
    return ok({ ...cached, cache: "hit" as const }, requestId);
  }

  const started = Date.now();
  try {
    const snaps = await composeFeeSnapshots(graphUrls(), {
      apiKey: env.GRAPH_API_KEY,
      lookbackHours,
    });
    if (snaps.length === 0) {
      log("warn", "intel.preview.no_data", { req: requestId, base, quote });
      return errorResponse(
        "no_data",
        "No standardized deployments answered in the lookback window.",
        requestId,
      );
    }
    const payload: FeeIntelPayload = {
      asOf: new Date().toISOString(),
      sources: snaps,
      recommendation: scoreToRecommendation(snaps),
      graphQueryIds: snaps.map((s) => s.subgraph),
    };
    cacheSet(key, payload, env.INTEL_CACHE_TTL_MS);
    log("info", "intel.preview.ok", {
      req: requestId,
      base,
      quote,
      sources: snaps.length,
      ms: Date.now() - started,
    });
    return ok(payload, requestId);
  } catch (e) {
    log("error", "intel.preview.upstream", { req: requestId, err: e instanceof Error ? e.message : String(e) });
    return errorResponse("upstream", e instanceof Error ? e.message : "Graph query failed", requestId);
  }
}
