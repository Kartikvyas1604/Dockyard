"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@dockyard/api";
import type { FeeIntelPayload, FeeIntelRequest } from "@dockyard/api";

export type IntelStatus = "idle" | "loading" | "ready" | "error";

/**
 * FeeMirror data hook — hits the ungated preview route.
 * The x402 paid path lives in useIntelPurchase.
 */
export function useIntelPreview(req: FeeIntelRequest | null) {
  const query = useQuery({
    queryKey: ["intel-preview", req?.base, req?.quote, req?.lookbackHours] as const,
    queryFn: ({ signal }) => endpoints.intel.preview(req as FeeIntelRequest, signal),
    enabled: req !== null,
    staleTime: 15_000,
    retry: 1,
  });

  const status: IntelStatus = query.isError
    ? "error"
    : query.isPending
      ? "idle"
      : query.isFetching
        ? "loading"
        : "ready";

  return {
    status,
    data: (query.data ?? null) as FeeIntelPayload | null,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: async () => {
      await query.refetch();
    },
  };
}
