/**
 * scripts/agent-buy-intel.ts — agent-side x402 Strategy Intel purchase.
 *
 * Wire flow (Hedera testnet via Blocky402 facilitator):
 *   1. GET  {BASE}/api/intel?base=WETH&quote=USDC
 *   2. ← 402 { x402: { accepts: [...] } }
 *   3. Build payment payload (sign per facilitator scheme), submit to
 *      facilitator /verify → settlement receipt
 *   4. GET again with X-PAYMENT header
 *   5. ← 200 FeeIntelPayload + receipt
 *
 * Env:
 *   BASE_URL                http://localhost:3000
 *   X402_FACILITATOR_URL    Blocky402 facilitator base
 *   HEDERA_OPERATOR_ID / HEDERA_OPERATOR_KEY  (signing account)
 *
 * Run: pnpm --filter @dockyard/web exec tsx ../../scripts/agent-buy-intel.ts
 */

type PaymentRequirements = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  payTo: string;
  asset: string;
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
    x402?: { accepts: PaymentRequirements[] };
  };
  const req402 = body.x402?.accepts?.[0];
  if (!req402) {
    console.error("[agent] 402 body missing x402.accepts:", JSON.stringify(body));
    process.exit(1);
  }
  console.log(`[agent] 2. got 402 — price ${req402.maxAmountRequired} tinybars to ${req402.payTo}`);

  // Signing: the production signing step uses the Hedera SDK to build the
  // facilitator's payment payload (crypto transfer of maxAmountRequired
  // tinybars HBAR to payTo). The exact payload shape is facilitator-defined —
  // consult the Blocky402 docs for /verify's accepted `payment` object and
  // plug it in here. Kept explicit (not mocked) so the paid path stays honest.
  console.log("[agent] 3. building payment payload (facilitator-defined shape)…");
  const paymentPayload = JSON.stringify({
    scheme: req402.scheme,
    network: req402.network,
    amount: req402.maxAmountRequired,
    asset: req402.asset,
    payTo: req402.payTo,
    resource: req402.resource,
    operatorId,
    // signature: <HEDERA_SDK_SIGNED_PAYLOAD — per Blocky402 /verify contract>
  });

  console.log("[agent] 4. verifying + settling via facilitator…");
  const verifyRes = await fetch(`${facilitator.replace(/\/$/, "")}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment: paymentPayload, resource: req402.resource }),
  });
  const verifyJson = (await verifyRes.json()) as { verified?: boolean; settled?: boolean; txHash?: string; reason?: string };
  if (!verifyJson.verified || !verifyJson.settled) {
    console.error("[agent] settlement failed:", verifyJson.reason ?? verifyJson);
    process.exit(1);
  }
  console.log(`[agent] settled: ${verifyJson.txHash ?? "(no tx hash returned)"}`);

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
