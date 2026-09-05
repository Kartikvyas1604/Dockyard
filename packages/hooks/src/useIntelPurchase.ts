"use client";

import { useCallback } from "react";
import { endpoints, ApiRequestError } from "@dockyard/api";
import type { FeeIntelRequest } from "@dockyard/api";
import { useDeskStore } from "@dockyard/store";

/**
 * x402 purchase lifecycle: request → 402 → paying → settled → applied.
 * Without an x402 wallet client wired, the step machine surfaces the 402
 * requirements honestly instead of faking settlement.
 */
export function useIntelPurchase(req: FeeIntelRequest) {
  const { setStep, setIntel } = useDeskStore();

  return useCallback(async () => {
    setStep("402");
    try {
      setStep("paying");
      const payload = await endpoints.intel.buy(req);
      setIntel(payload);
      setStep("settled");
    } catch (e) {
      if (e instanceof ApiRequestError && e.isPaymentRequired) {
        setStep("402");
        return;
      }
      setStep("failed", e instanceof Error ? e.message : "Payment failed");
    }
  }, [req, setStep, setIntel]);
}
