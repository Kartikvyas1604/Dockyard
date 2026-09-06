import { NextResponse } from "next/server";

/**
 * Consistent v1 error envelope. Every backend route returns this shape
 * on failure so UI + agent scripts + judges see one contract.
 *
 * { error, message, requestId, retryable, details? }
 */

export type ErrorCode =
  | "bad_request"
  | "payment_required"
  | "payment_unverified"
  | "not_configured"
  | "no_data"
  | "upstream"
  | "rate_limited"
  | "conflict"
  | "internal";

export type ErrorEnvelope = {
  error: ErrorCode;
  message: string;
  requestId: string;
  retryable: boolean;
  details?: unknown;
};

const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  payment_required: 402,
  payment_unverified: 402,
  not_configured: 501,
  no_data: 502,
  upstream: 502,
  rate_limited: 429,
  conflict: 409,
  internal: 500,
};

export function errorResponse(
  code: ErrorCode,
  message: string,
  requestId: string,
  opts?: { details?: unknown; status?: number; headers?: HeadersInit; extra?: Record<string, unknown> },
): NextResponse {
  const body: ErrorEnvelope & Record<string, unknown> = {
    error: code,
    message,
    requestId,
    retryable: opts?.status
      ? opts.status === 429 || opts.status >= 500
      : STATUS[code] === 429 || STATUS[code] >= 500,
    ...(opts?.details !== undefined ? { details: opts.details } : {}),
    ...(opts?.extra ?? {}),
  };
  return NextResponse.json(body, {
    status: opts?.status ?? STATUS[code],
    headers: { "x-request-id": requestId, ...(opts?.headers ?? {}) },
  });
}

export function ok<T>(data: T, requestId: string, init?: { headers?: HeadersInit; status?: number }): NextResponse {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: { "x-request-id": requestId, ...(init?.headers ?? {}) },
  });
}
