import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";

/** Resolve or mint a request id. Echoed on every response for log correlation. */
export function requestIdFrom(req: Request): string {
  const incoming =
    req.headers.get(REQUEST_ID_HEADER) ?? req.headers.get("x-correlation-id");
  if (incoming && /^[A-Za-z0-9_-]{1,64}$/.test(incoming)) return incoming;
  return randomUUID().slice(0, 8);
}

type Level = "debug" | "info" | "warn" | "error";

/**
 * Structured JSON logger. One line per call, always includes requestId.
 * Vercel log drains can filter on `req`.
 */
export function log(level: Level, msg: string, fields?: Record<string, unknown>): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    svc: "dockyard-web",
    level,
    msg,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
