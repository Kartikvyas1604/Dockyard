/**
 * The Graph — Messari standardized DEX subgraph query.
 * ONE query pattern applied across N protocol deployments (standards leverage):
 * each configured subgraph gets the identical financialsDailySnapshot query.
 * Field names follow the Messari standardized DEX schema; tune per deployment
 * in GRAPH_SUBGRAPH_URLS if a deployment lags the schema.
 */

export type StandardizedSnapshot = {
  protocol: string;
  subgraph: string;
  feeUsd24h: number;
  volumeUsd24h: number;
};

const STANDARDIZED_QUERY = /* GraphQL */ `
  query FeeMirror24h($currentDay: Int) {
    financialsDailySnapshots(
      first: 1
      orderBy: day
      orderDirection: desc
      where: { day_gte: $currentDay }
    ) {
      day
      dailySupplySideRevenueUSD
      dailyVolumeUSD
    }
  }
`;

function daysSinceEpoch(now = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

export function subgraphUrls(): string[] {
  return (process.env.GRAPH_SUBGRAPH_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Run the standardized query against every deployment and compose the result. */
export async function composeFeeSnapshots(
  urls: string[],
): Promise<StandardizedSnapshot[]> {
  const day = daysSinceEpoch();

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.GRAPH_API_KEY
            ? { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({
          query: STANDARDIZED_QUERY,
          variables: { currentDay: day - 1 },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`subgraph ${res.status}`);
      const json = (await res.json()) as {
        data?: {
          financialsDailySnapshots?: {
            dailySupplySideRevenueUSD: string;
            dailyVolumeUSD: string;
          }[];
        };
        errors?: { message: string }[];
      };
      const snap = json.data?.financialsDailySnapshots?.[0];
      if (!snap) throw new Error("no snapshot for window");
      return {
        protocol: protocolName(url),
        subgraph: url,
        feeUsd24h: Number(snap.dailySupplySideRevenueUSD) || 0,
        volumeUsd24h: Number(snap.dailyVolumeUSD) || 0,
      } satisfies StandardizedSnapshot;
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<StandardizedSnapshot> => r.status === "fulfilled")
    .map((r) => r.value);
}

function protocolName(url: string): string {
  const match = url.match(/([a-z0-9-]+)(?:-ethereum)?\/?$/i);
  return match?.[1] ?? url.slice(0, 24);
}

/** Fee/volume → ship params. Deterministic scoring, no black box. */
export function scoreToRecommendation(snaps: StandardizedSnapshot[]) {
  const best = [...snaps].sort((a, b) => b.feeUsd24h - a.feeUsd24h)[0];
  const totalVolume = snaps.reduce((acc, s) => acc + s.volumeUsd24h, 0);
  // Fee-tier heuristic: thin-fee venues clear more volume — go tighter and
  // concentrated; otherwise hold the standard 30 bps concentrated band.
  const feeBps = best && totalVolume > 0 && best.feeUsd24h / totalVolume < 0.0005 ? 10 : 30;
  return {
    programKind: "XYCConcentrate" as const,
    feeBps,
    tickLower: -600,
    tickUpper: 600,
    rationale: `Composed from ${snaps.length} standardized deployment(s). Top fee venue: ${best?.protocol ?? "n/a"}; recommended band centers current price.`,
  };
}
