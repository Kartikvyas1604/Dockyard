import { createHash } from "node:crypto";
import type { FeeIntelPayload } from "@dockyard/api";

/**
 * Receipt cache: idempotency for paid intel.
 * Key = sha256(X-PAYMENT). A retried payment header returns the SAME
 * payload without re-querying Graph or re-settling — safe retries for
 * agents and the Pay stepper. 10-min TTL, 500-entry bound.
 */

type Receipt = { payload: FeeIntelPayload; txHash?: string; storedAt: number };

const receipts = new Map<string, Receipt>();
const TTL_MS = 10 * 60 * 1000;
const MAX = 500;

export function receiptKey(paymentHeader: string): string {
  return createHash("sha256").update(paymentHeader).digest("hex").slice(0, 32);
}

export function getReceipt(paymentHeader: string): Receipt | null {
  const r = receipts.get(receiptKey(paymentHeader));
  if (!r) return null;
  if (Date.now() - r.storedAt > TTL_MS) {
    receipts.delete(receiptKey(paymentHeader));
    return null;
  }
  return r;
}

export function putReceipt(paymentHeader: string, payload: FeeIntelPayload, txHash?: string): void {
  if (receipts.size >= MAX) {
    const oldest = receipts.keys().next().value;
    if (oldest) receipts.delete(oldest);
  }
  receipts.set(receiptKey(paymentHeader), { payload, txHash, storedAt: Date.now() });
}

/** For tests. */
export function resetReceipts(): void {
  receipts.clear();
}
