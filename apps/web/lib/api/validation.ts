import { z } from "zod";

/**
 * Shared intel request validation. Single source of truth for
 * /api/intel/preview and /api/intel (GET query + POST body).
 * Guards: EVM address format, lookback window bounds, unknown-field strip.
 */

const addressOrSymbol = z
  .string()
  .min(1)
  .max(100)
  .refine(
    (v) => /^0x[0-9a-fA-F]{40}$/.test(v) || /^[A-Z]{2,12}(:[A-Z]{2,12})?$/.test(v),
    "base/quote must be a 0x address or UPPER symbol (e.g. WETH or WETH:USDC)",
  );

export const feeIntelRequestSchema = z
  .object({
    base: addressOrSymbol,
    quote: addressOrSymbol,
    lookbackHours: z.coerce.number().int().min(1).max(168).default(24),
  })
  .strict();

export type ValidatedIntelRequest = z.infer<typeof feeIntelRequestSchema>;

/** Parse POST JSON bodies; returns discriminated result for 400 mapping. */
export function parseIntelBody(
  body: unknown,
): { ok: true; value: ValidatedIntelRequest } | { ok: false; issues: z.ZodIssue[] } {
  const parsed = feeIntelRequestSchema.safeParse(body);
  if (parsed.success) return { ok: true, value: parsed.data };
  return { ok: false, issues: parsed.error.issues };
}

/** Parse GET query (?base=&quote=&lookbackHours=). */
export function parseIntelQuery(
  search: URLSearchParams,
): { ok: true; value: ValidatedIntelRequest } | { ok: false; issues: z.ZodIssue[] } {
  return parseIntelBody({
    base: search.get("base"),
    quote: search.get("quote"),
    lookbackHours: search.get("lookbackHours") ?? undefined,
  });
}
