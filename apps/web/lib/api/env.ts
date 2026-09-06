import { z } from "zod";

/**
 * Server env validation (zod). Fail-soft: routes check `envStatus()`
 * and return honest 501s — never crash boot on Vercel when optional
 * integrations aren't configured yet.
 */

const serverEnvSchema = z.object({
  GRAPH_API_KEY: z.string().optional(),
  GRAPH_SUBGRAPH_URLS: z.string().optional(),
  HEDERA_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  HEDERA_OPERATOR_ID: z.string().optional(),
  X402_FACILITATOR_URL: z.string().url().optional().or(z.literal("")),
  INTEL_PRICE_HBAR: z
    .string()
    .regex(/^\d*\.?\d+$/)
    .default("0.05"),
  INTEL_CACHE_TTL_MS: z.coerce.number().int().min(5_000).max(300_000).default(30_000),
  INTEL_RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).max(600).default(30),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (!cached) {
    cached = serverEnvSchema.parse({
      GRAPH_API_KEY: process.env.GRAPH_API_KEY || undefined,
      GRAPH_SUBGRAPH_URLS: process.env.GRAPH_SUBGRAPH_URLS || undefined,
      HEDERA_NETWORK: process.env.HEDERA_NETWORK || undefined,
      HEDERA_OPERATOR_ID: process.env.HEDERA_OPERATOR_ID || undefined,
      X402_FACILITATOR_URL: process.env.X402_FACILITATOR_URL || undefined,
      INTEL_PRICE_HBAR: process.env.INTEL_PRICE_HBAR || undefined,
      INTEL_CACHE_TTL_MS: process.env.INTEL_CACHE_TTL_MS || undefined,
      INTEL_RATE_LIMIT_PER_MIN: process.env.INTEL_RATE_LIMIT_PER_MIN || undefined,
    });
  }
  return cached;
}

/** For tests: reset memoised env. */
export function resetServerEnvCache(): void {
  cached = null;
}

export function graphUrls(): string[] {
  return (serverEnv().GRAPH_SUBGRAPH_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8); // bound fan-out: max 8 deployments per request
}

export function isGraphConfigured(): boolean {
  return graphUrls().length > 0;
}

export function isX402Configured(): boolean {
  const e = serverEnv();
  return Boolean(e.X402_FACILITATOR_URL && e.HEDERA_OPERATOR_ID);
}
