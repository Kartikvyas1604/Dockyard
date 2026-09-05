import type { ApiError, FeeIntelPayload, FeeIntelRequest, IntelErrorResponse } from "./types";

/**
 * Base client for Dockyard APIs (web + extension share this).
 * Native swaps the fetch impl via setFetchImpl at bootstrap.
 */

type FetchImpl = typeof fetch;
let fetchImpl: FetchImpl = (...args) => fetch(...args);

export function setFetchImpl(custom: FetchImpl): void {
  fetchImpl = custom;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError | IntelErrorResponse | unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiRequestError";
  }

  get isPaymentRequired(): boolean {
    return this.status === 402;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function request<T>(
  path: string,
  init?: RequestInit & { baseUrl?: string },
): Promise<T> {
  const base = init?.baseUrl ?? "";
  const res = await fetchImpl(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiRequestError(res.status, await parseBody(res));
  }
  return (await res.json()) as T;
}

export const endpoints = {
  intel: {
    /** Ungated preview path for iteration; demo path must use the x402 route. */
    preview: (req: FeeIntelRequest, signal?: AbortSignal) =>
      request<FeeIntelPayload>("/api/intel/preview", {
        method: "POST",
        body: JSON.stringify(req),
        signal,
      }),
    /** x402-gated. Throws ApiRequestError(402) with payment requirements. */
    buy: (req: FeeIntelRequest, paymentHeader?: string) =>
      request<FeeIntelPayload>("/api/intel", {
        method: "POST",
        body: JSON.stringify(req),
        headers: paymentHeader ? { "X-PAYMENT": paymentHeader } : undefined,
      }),
  },
};
