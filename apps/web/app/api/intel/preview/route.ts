import { NextResponse } from "next/server";
import { composeFeeSnapshots, scoreToRecommendation } from "@/lib/graph/standardized-query";
import type { FeeIntelPayload } from "@dockyard/api";

/**
 * Ungated intel preview — for iteration only. The judged demo path must go
 * through the x402 route at /api/intel.
 */
export async function POST(req: Request) {
  if (!process.env.GRAPH_SUBGRAPH_URLS) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "GRAPH_SUBGRAPH_URLS is not set. Add Messari standardized DEX deployment URLs — the panel shows an honest error, never mock data.",
      },
      { status: 501 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { base?: string; quote?: string; lookbackHours?: number }
    | null;
  if (!body?.base || !body?.quote) {
    return NextResponse.json(
      { error: "bad_request", message: "base and quote are required" },
      { status: 400 },
    );
  }

  try {
    const snaps = await composeFeeSnapshots(process.env.GRAPH_SUBGRAPH_URLS.split(","));
    if (snaps.length === 0) {
      return NextResponse.json(
        {
          error: "no_data",
          message: "No standardized deployments answered in the lookback window.",
        },
        { status: 502 },
      );
    }

    const payload: FeeIntelPayload = {
      asOf: new Date().toISOString(),
      sources: snaps,
      recommendation: scoreToRecommendation(snaps),
      graphQueryIds: snaps.map((s) => s.subgraph),
    };
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      {
        error: "upstream",
        message: e instanceof Error ? e.message : "Graph query failed",
      },
      { status: 502 },
    );
  }
}
