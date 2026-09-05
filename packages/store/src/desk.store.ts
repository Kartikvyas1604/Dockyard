import { create } from "zustand";
import type { FeeIntelPayload, ProgramKind, SuggestedBy } from "@dockyard/api";

export type ShipFormState = {
  tokenIn: string;
  tokenOut: string;
  programKind: ProgramKind;
  feeBps: number;
  tickLower: string;
  tickUpper: string;
  notional: string;
  suggestedBy: SuggestedBy;
};

const initialForm: ShipFormState = {
  tokenIn: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC (base) — placeholder pair, override in UI
  tokenOut: "0x4200000000000000000000000000000000000006", // WETH
  programKind: "XYCConcentrate",
  feeBps: 30,
  tickLower: "-600",
  tickUpper: "600",
  notional: "",
  suggestedBy: "manual",
};

type IntelState = {
  intel: FeeIntelPayload | null;
  step: "idle" | "402" | "paying" | "settled" | "applied" | "failed";
  stepError: string | null;
};

type Toast = { id: number; kind: "shipped" | "docked" | "error" | "info"; message: string };

type DeskState = {
  form: ShipFormState;
  setForm: (patch: Partial<ShipFormState>) => void;
  resetForm: () => void;

  intel: IntelState;
  setIntel: (payload: FeeIntelPayload | null) => void;
  setStep: (step: IntelState["step"], error?: string | null) => void;

  /** Apply FeeMirror / x402 recommendation into the ship form. */
  applyIntel: (payload: FeeIntelPayload, by: SuggestedBy) => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useDeskStore = create<DeskState>((set) => ({
  form: initialForm,
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  resetForm: () => set({ form: initialForm }),

  intel: { intel: null, step: "idle", stepError: null },
  setIntel: (payload) => set((s) => ({ intel: { ...s.intel, intel: payload } })),
  setStep: (step, error = null) =>
    set((s) => ({ intel: { ...s.intel, step, stepError: error } })),

  applyIntel: (payload, by) =>
    set((s) => ({
      form: {
        ...s.form,
        programKind: payload.recommendation.programKind,
        feeBps: payload.recommendation.feeBps,
        tickLower:
          payload.recommendation.tickLower !== undefined
            ? String(payload.recommendation.tickLower)
            : s.form.tickLower,
        tickUpper:
          payload.recommendation.tickUpper !== undefined
            ? String(payload.recommendation.tickUpper)
            : s.form.tickUpper,
        suggestedBy: by,
      },
      intel: { ...s.intel, intel: payload, step: "applied" },
    })),

  toasts: [],
  pushToast: (t) =>
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id: ++toastId }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
