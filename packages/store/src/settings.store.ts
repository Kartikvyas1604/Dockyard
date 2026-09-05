import { create } from "zustand";

type SettingsState = {
  chainId: number;
  demoFork: boolean;
  setChainId: (id: number) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  chainId: 1,
  demoFork: false,
  setChainId: (chainId) => set({ chainId }),
}));
