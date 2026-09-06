import { keccak256, encodeAbiParameters, parseAbiParameters, isAddress } from "viem";
import { z } from "zod";

/**
 * Aqua strategy validation (offline, no custody).
 * Backend never holds keys or tokens — it validates ship drafts and
 * derives the immutable strategyHash = keccak256(abi.encode(strategy))
 * so the UI can display it before the wallet signs ship().
 */

export const AQUA_ROUTER = "0x1111113ccf1426a8e30e2bff5e005d929bf6a90a" as const;
export const AQUA_SWAPVM_ROUTER = "0x111111338c5091e8440b67b168bae16a668ac0de" as const;

export const strategyDraftSchema = z
  .object({
    programKind: z.enum(["XYCConcentrate", "XYC"]),
    tokenIn: z.string().refine((v) => isAddress(v), "tokenIn must be a 0x address"),
    tokenOut: z.string().refine((v) => isAddress(v), "tokenOut must be a 0x address"),
    feeBps: z.number().int().min(1).max(10_000),
    tickLower: z.number().int().min(-887272).max(887272).optional(),
    tickUpper: z.number().int().min(-887272).max(887272).optional(),
    notional: z.string().regex(/^\d*\.?\d+$/, "notional must be a decimal string"),
    chainId: z.number().int().positive().default(1),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.tokenIn.toLowerCase() === v.tokenOut.toLowerCase()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tokenIn and tokenOut must differ", path: ["tokenOut"] });
    }
    if (v.programKind === "XYCConcentrate") {
      if (v.tickLower === undefined || v.tickUpper === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "XYCConcentrate requires tickLower + tickUpper", path: ["tickLower"] });
      } else if (v.tickLower >= v.tickUpper) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tickLower must be below tickUpper", path: ["tickLower"] });
      }
    }
    if (Number(v.notional) <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "notional must be greater than 0", path: ["notional"] });
    }
  });

export type StrategyDraft = z.infer<typeof strategyDraftSchema>;

/**
 * Deterministic strategy hash. Mirrors the SDK's
 * keccak256(abi.encode(strategy)) semantics at the param level so the
 * desk can show a stable id before ship; the on-chain hash from the
 * Shipped event remains authoritative post-ship.
 */
export function strategyHash(d: StrategyDraft): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters("string programKind, address tokenIn, address tokenOut, uint24 feeBps, int24 tickLower, int24 tickUpper, uint256 chainId"),
      [
        d.programKind,
        d.tokenIn as `0x${string}`,
        d.tokenOut as `0x${string}`,
        d.feeBps,
        d.tickLower ?? 0,
        d.tickUpper ?? 0,
        BigInt(d.chainId),
      ],
    ),
  );
}

/** Exact-allowance guidance: never recommend unlimited approvals. */
export function allowanceGuidance(notional: string): {
  mode: "exact";
  warning: string;
} {
  return {
    mode: "exact",
    warning: `Approve exactly ${notional} (token units) to ${AQUA_ROUTER}. Unlimited approvals stay behind an explicit confirm and are never the default.`,
  };
}
