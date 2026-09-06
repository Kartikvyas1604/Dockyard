import { ok } from "@/lib/api/errors";
import { requestIdFrom } from "@/lib/api/request";

/** GET /api/health — liveness. No deps, always 200 when the runtime is alive. */
export async function GET(req: Request) {
  const requestId = requestIdFrom(req);
  return ok({ status: "ok", version: "v1", time: new Date().toISOString() }, requestId);
}
