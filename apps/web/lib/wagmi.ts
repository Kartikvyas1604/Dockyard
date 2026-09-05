import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

/**
 * MVP targets one EVM chain for the Aqua demo (Anvil fork in demo mode).
 * Documented chain id comes from NEXT_PUBLIC_CHAIN_ID.
 */
export const config = createConfig({
  chains: [mainnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});

export const AQUA_ROUTER = "0x1111113ccf1426a8e30e2bff5e005d929bf6a90a" as const;
export const AQUA_SWAPVM_ROUTER = "0x111111338c5091e8440b67b168bae16a668ac0de" as const;
