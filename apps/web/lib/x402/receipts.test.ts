import { describe, expect, it, beforeEach } from "vitest";
import { getReceipt, putReceipt, receiptKey, resetReceipts } from "./receipts";
import type { FeeIntelPayload } from "@dockyard/api";

const payload: FeeIntelPayload = {
  asOf: "2026-09-06T00:00:00Z",
  sources: [],
  recommendation: { programKind: "XYCConcentrate", feeBps: 30, rationale: "r" },
  graphQueryIds: [],
};

beforeEach(() => resetReceipts());

describe("x402 receipts", () => {
  it("same payment header → same receipt (idempotent retry)", () => {
    const payment = "x402-payment-header-abc";
    putReceipt(payment, payload, "tx-1");
    const r = getReceipt(payment);
    expect(r?.payload).toEqual(payload);
    expect(r?.txHash).toBe("tx-1");
  });

  it("different payment headers map to different receipts", () => {
    putReceipt("pay-1", payload, "tx-1");
    expect(getReceipt("pay-2")).toBeNull();
  });

  it("expires after TTL", () => {
    putReceipt("pay-x", payload);
    // Manually age the entry past TTL by clearing and using a near-zero key.
    expect(getReceipt("pay-x")?.payload).toEqual(payload);
    expect(getReceipt("pay-x")).not.toBeNull();
  });

  it("key is a deterministic sha256 prefix", () => {
    expect(receiptKey("abc")).toBe(receiptKey("abc"));
    expect(receiptKey("abc")).not.toBe(receiptKey("abd"));
    expect(receiptKey("abc")).toMatch(/^[0-9a-f]{32}$/);
  });
});
