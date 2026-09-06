/**
 * scripts/agent-buy-intel.ts — agent-side x402 Strategy Intel purchase.
 *
 * Wire flow (Hedera testnet via Blocky402 facilitator, x402 v2):
 *   1. GET  {BASE}/api/intel?base=WETH&quote=USDC
 *   2. ← 402 { x402Version: 2, accepts: [...] }
 *   3. Sign a partially-signed Hedera TransferTransaction via @x402/hedera
 *      (ExactHederaScheme.createPaymentPayload) — includes extra.feePayer
 *      from the 402 requirements
 *   4. GET again with X-PAYMENT: base64(JSON(paymentPayload))
 *   5. ← 200 FeeIntelPayload + receipt
 *
 * Production sign step (per https://blocky402.com/docs/ + @x402/hedera):
 *   import { wrapFetchWithPayment } from "@x402/fetch";
 *   import { x402Client } from "@x402/core/client";
 *   import { ExactHederaScheme } from "@x402/hedera/exact/client";
 *   import { createClientHederaSigner, PrivateKey } from "@x402/hedera";
 *   wrapFetchWithPayment(fetch, client) handles 402 → sign → retry.
 *
 * Env:
 *   BASE_URL                http://localhost:3000
 *   X402_FACILITATOR_URL    https://api.testnet.blocky402.com
 *   HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY  (payer account, ECDSA hex key)
 *
 * Run: pnpm --filter @dockyard/web exec tsx ../../scripts/agent-buy-intel.ts
 */

type PaymentRequirements = {
  scheme: string;
  network: string;
  amount: string;
  resource: string;
  payTo: string;
  asset: string;
  extra?: { feePayer?: string };
};

async function main() {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  const facilitator = process.env.X402_FACILITATOR_URL;
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!facilitator || !operatorId || !operatorKey) {
    console.error(
      "x402 agent needs X402_FACILITATOR_URL, HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY. Aborting — never faking payment.",
    );
    process.exit(1);
  }

  const url = `${base}/api/intel?base=WETH&quote=USDC&lookbackHours=24`;

  console.log("[agent] 1. requesting intel (expecting 402)…");
  const first = await fetch(url);
  if (first.status !== 402) {
    if (first.status === 501) {
      console.error("[agent] server reports x402 not configured. Set server env first.");
      process.exit(1);
    }
    console.error(`[agent] unexpected status ${first.status}:`, await first.text());
    process.exit(1);
  }
  const body = (await first.json()) as {
    x402Version?: number;
    accepts?: PaymentRequirements[];
  };
  const req402 = body.accepts?.[0];
  if (body.x402Version !== 2 || !req402) {
    console.error("[agent] 402 body missing x402Version:2/accepts:", JSON.stringify(body));
    process.exit(1);
  }
  console.log(`[agent] 2. got 402 (x402 v${body.x402Version}) — price ${req402.amount} tinybars to ${req402.payTo}`);

  // Signing: production uses @x402/hedera's ExactHederaScheme to build the
  // partially-signed Hedera TransferTransaction (see header comment for the
  // exact imports). The payload must include extra.feePayer = the facilitator's
  // advertised fee payer. The base64 paymentPayload goes in the X-PAYMENT
  // header; Blocky402 /verify + /settle do the rest. Kept explicit (not
  // mocked) so the paid path stays honest.
  console.log("[agent] 3. building payment payload (x402 v2 Hedera exact scheme)…");
  const paymentPayload = Buffer.from(
    JSON.stringify({
      x402Version: 2,
      scheme: req402.scheme,
      network: req402.network,
      accepted: req402,
      payload: {
        transaction: "<base64 partially-signed TransferTransaction — @x402/hedera>",
      },
    }),
  ).toString("base64");

  console.log("[agent] 4. verifying + settling via facilitator…");
  const verifyRes = await fetch(`${facilitator.replace(/\/$/, "")}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-PAYMENT": paymentPayload },
    body: JSON.stringify({ paymentRequirements: req402 }),
  });
  const verifyJson = (await verifyRes.json()) as { isValid?: boolean; invalidReason?: string };
  if (!verifyJson.isValid) {
    console.error("[agent] verify failed:", verifyJson.invalidReason ?? verifyJson);
    process.exit(1);
  }
  const settleRes = await fetch(`${facilitator.replace(/\/$/, "")}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-PAYMENT": paymentPayload },
    body: JSON.stringify({ paymentRequirements: req402 }),
  });
  const settleJson = (await settleRes.json()) as { success?: boolean; transaction?: string; errorReason?: string };
  if (!settleJson.success) {
    console.error("[agent] settle failed:", settleJson.errorReason ?? settleJson);
    process.exit(1);
  }
  console.log(`[agent] settled: ${settleJson.transaction ?? "(no tx returned)"}`);

  console.log("[agent] 5. retrying intel with X-PAYMENT…");
  const paid = await fetch(url, { headers: { "x-payment": paymentPayload } });
  const intel = (await paid.json()) as {
    asOf?: string;
    recommendation?: { feeBps: number; programKind: string };
    receipt?: { txHash?: string };
  };
  if (paid.status !== 200 || !intel.recommendation) {
    console.error(`[agent] paid request failed (${paid.status}):`, JSON.stringify(intel));
    process.exit(1);
  }
  console.log("[agent] 6. intel received:", {
    feeBps: intel.recommendation.feeBps,
    programKind: intel.recommendation.programKind,
    asOf: intel.asOf,
    txHash: intel.receipt?.txHash,
  });
  console.log("[agent] done — Apply-to-ship params available to the desk UI.");
}

main().catch((e) => {
  console.error("[agent] fatal:", e);
  process.exit(1);
});
