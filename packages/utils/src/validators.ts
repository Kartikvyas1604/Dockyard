import { z } from "zod";

export const programKindSchema = z.enum(["XYCConcentrate", "XYC"]);
export type ProgramKind = z.infer<typeof programKindSchema>;

export const shipDraftSchema = z.object({
  programKind: programKindSchema,
  feeBps: z.number().int().min(1).max(10_000),
  tickLower: z.number().int().optional(),
  tickUpper: z.number().int().optional(),
  notional: z
    .string()
    .regex(/^\d*\.?\d+$/, "Enter a decimal amount, e.g. 1250.00"),
  suggestedBy: z.enum(["manual", "graph", "x402"]).default("manual"),
});
export type ShipDraft = z.infer<typeof shipDraftSchema>;

export const evmAddressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address");
export const hashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "Invalid hash");

/** Validate a notional input string; returns an error message or null. */
export function validateNotional(value: string): string | null {
  if (value.trim() === "") return "Notional is required";
  if (!/^\d*\.?\d+$/.test(value)) return "Enter a decimal amount, e.g. 1250.00";
  if (Number(value) <= 0) return "Notional must be greater than 0";
  return null;
}

/** Concentrated range sanity: lower must sit below upper. */
export function validateTickRange(
  lower: number | undefined,
  upper: number | undefined,
): string | null {
  if (lower === undefined || upper === undefined) return null;
  if (lower >= upper) return "Lower tick must be below upper tick";
  return null;
}
