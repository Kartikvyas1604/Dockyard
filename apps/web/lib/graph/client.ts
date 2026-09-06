import { z } from "zod";

/**
 * Hardened Messari standardized DEX client.
 * One query pattern → N protocol deployments (standards leverage).
 * Hardening vs the scaffold version: per-url timeout isolation, one
 * retry with backoff, zod response guard, lookback-window clamp.
 */

export type StandardizedSnapshot = {
  protocol: string;
  subgraph: string;
  feeUsd24h: number;
  volumeUsd24h: number;
};

const STANDARDIZED_QUERY = /* GraphQL */ `
  query FeeMirror24h($daysAgo: Int) {
    financialsDailySnapshots(
      first: 2
      orderBy: day
      orderDirection: desc
      where: { day_gte: $daysAgo }
    ) {
      day
      dailySupplySideRevenueUSD
      dailyVolumeUSD
    }
  }
`;

const snapshotSchema = z.object({
  day: z.number().optional(),
  dailySupplySideRevenueUSD: z.coerce.number().default(0),
  dailyVolumeUSD: z.coerce.number().default(0),
});

const responseSchema = z.object({
  data: z
    .object({ financialsDailySnapshots: z.array(snapshotSchema).optional() })
    .optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

function daysSinceEpoch(now = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

function protocolName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^(api|gateway)\./, "");
    const tail = new URL(url).pathname.split("/").filter(Boolean).slice(-2).join("/");
    return tail || host;
  } catch {
    return url.slice(0, 32);
  }
}

async function fetchOne(
  url: string,
  apiKey: string | undefined,
  daysAgo: number,
  timeoutMs: number,
): Promise<StandardizedSnapshot> {
  const attempt = async (): Promise<StandardizedSnapshot> => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ query: STANDARDIZED_QUERY, variables: { daysAgo } }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`subgraph http ${res.status}`);
      const json = responseSchema.parse(await res.json());
      if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "graph error");
      const snaps = json.data?.financialsDailySnapshots ?? [];
      if (snaps.length === 0) throw new Error("no snapshot for window");
      const latest = snaps[0]!;
      return {
        protocol: protocolName(url),
        subgraph: url,
        feeUsd24h: Number(latest.dailySupplySideRevenueUSD) || 0,
        volumeUsd24h: Number(latest.dailyVolumeUSD) || 0,
      };
    } finally {
      clearTimeout(t);
    }
  };

  try {
    return await attempt();
  } catch (e) {
    // One retry with ~300ms backoff; a second failure drops this deployment
    // (Promise.allSettled at the caller keeps the panel partial, not dead).
    await new Promise((r) => setTimeout(r, 300));
    return attempt().catch(() => {
      throw e;
    });
  }
}

/** Run the standardized query against every deployment; partial success OK. */
export async function composeFeeSnapshots(
  urls: string[],
  opts?: { apiKey?: string; lookbackHours?: number; timeoutMs?: number },
): Promise<StandardizedSnapshot[]> {
  const bounded = urls.slice(0, 8);
  const daysBack = Math.min(7, Math.max(1, Math.ceil((opts?.lookbackHours ?? 24) / 24)));
  const day = daysSinceEpoch();

  const results = await Promise.allSettled(
    bounded.map((url) =>
      fetchOne(url, opts?.apiKey, day - daysBack, opts?.timeoutMs ?? 8000),
    ),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<StandardizedSnapshot> => r.status === "fulfilled")
    .map((r) => r.value);
}

/** Fee/volume → ship params. Deterministic scoring, no black box. */
export function scoreToRecommendation(snaps: StandardizedSnapshot[]) {
  const best = [...snaps].sort((a, b) => b.feeUsd24h - a.feeUsd24h)[0];
  const totalVolume = snaps.reduce((acc, s) => acc + s.volumeUsd24h, 0);
  const feeBps = best && totalVolume > 0 && best.feeUsd24h / totalVolume < 0.0005 ? 10 : 30;
  // Width heuristic: dominant venue (>60% of fees) → tighter band; else standard.
  const totalFees = snaps.reduce((acc, s) => acc + s.feeUsd24h, 0);
  const concentrated = best && totalFees > 0 && best.feeUsd24h / totalFees > 0.6;
  return {
    programKind: "XYCConcentrate" as const,
    feeBps,
    tickLower: concentrated ? -300 : -600,
    tickUpper: concentrated ? 300 : 600,
    rationale: `Composed from ${snaps.length} standardized deployment(s). Top fee venue: ${best?.protocol ?? "n/a"}; recommended band centers current price.`,
  };
}
