"use client";

import { useCallback, useEffect, useState } from "react";
import { endpoints } from "@dockyard/api";
import type { FeeIntelPayload, FeeIntelRequest } from "@dockyard/api";

export type IntelStatus = "idle" | "loading" | "ready" | "error";

/**
 * FeeMirror data hook — hits the ungated preview route.
 * The x402 paid path lives in useIntelPurchase.
 */
export function useIntelPreview(req: FeeIntelRequest | null) {
  const [status, setStatus] = useState<IntelStatus>("idle");
  const [data, setData] = useState<FeeIntelPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!req) return;
    setStatus("loading");
    setError(null);
    try {
      const payload = await endpoints.intel.preview(req);
      setData(payload);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reach the Graph");
      setStatus("error");
    }
  }, [req]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, data, error, refresh };
}
