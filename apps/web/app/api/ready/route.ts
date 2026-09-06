import { errorResponse, ok } from "@/lib/api/errors";
import { isGraphConfigured, isX402Configured } from "@/lib/api/env";
import { requestIdFrom } from "@/lib/api/request";

/**
 * GET /api/ready — readiness with dependency status.
 * Reports each dependency honestly (configured / degraded) without leaking
 * secrets. 200 when the API can serve, 503 only if core deps are absent.
 */
export async function GET(req: Request) {
  const requestId = requestIdFrom(req);

  const deps = {
    graph: {
      required: true,
      status: isGraphConfigured() ? ("ok" as const) : ("unconfigured" as const),
    },
    x402: {
      required: false,
      status: isX402Configured() ? ("ok" as const) : ("unconfigured" as const),
    },
  };

  const coreOk = deps.graph.status === "ok";
  const body = {
    status: coreOk ? ("ready" as const) : ("degraded" as const),
    version: "v1",
    deps,
    time: new Date().toISOString(),
  };
  return coreOk ? ok(body, requestId) : errorResponse("not_configured", "Core dependencies unconfigured.", requestId, { status: 503, details: body });
}
