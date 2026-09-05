import { NextResponse } from "next/server";
import type { IntelErrorResponse } from "@dockyard/api";

/**
 * x402-gated Strategy Intel.
 * Unpaid request → HTTP 402 with payment requirements (Blocky402 facilitator,
 * Hedera testnet). Paid request (X-PAYMENT header) → verify + settle via the
 * facilitator, then return the same payload shape as /api/intel/preview.
 */

function priceUnits(): string {
  const hbar = Number(process.env.INTEL_PRICE_HBAR ?? "0.05");
  return String(Math.round(hbar * 1e8)); // tinybars base units
}

function paymentRequirements() {
  return {
    scheme: "exact",
    network: process.env.HEDERA_NETWORK ?? "testnet",
    maxAmountRequired: priceUnits(),
    resource: "/api/intel",
    description: "Dockyard Strategy Intel — 24h standardized DEX fee/volume + params",
    mimeType: "application/json",
    payTo: process.env.HEDERA_OPERATOR_ID ?? "",
    asset: "HBAR",
    maxTimeoutSeconds: 60,
  };
}

export async function POST(req: Request) {
  const payment = req.headers.get("x-payment");

  if (!payment) {
    if (!process.env.X402_FACILITATOR_URL || !process.env.HEDERA_OPERATOR_ID) {
      return NextResponse.json(
        {
          error: "not_configured",
          message:
            "x402 facilitator not configured (X402_FACILITATOR_URL, HEDERA_OPERATOR_ID). The 402 flow below is the wire contract.",
        },
        {
          status: 501,
        },
      );
    }
    const body: IntelErrorResponse = {
      error: "payment_required",
      x402: { version: 1, accepts: [paymentRequirements()] },
    };
    return NextResponse.json(body, { status: 402 });
  }

  // TODO(Day 4): verify X-PAYMENT with Blocky402 facilitator → settle on Hedera
  // testnet → only then query Graph and return the intel payload.
  return NextResponse.json(
    {
      error: "payment_unverified",
      message: "Facilitator verification is wired on the Hedera build day.",
    },
    { status: 402 },
  );
}
