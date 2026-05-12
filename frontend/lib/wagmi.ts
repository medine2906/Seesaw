import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [metaMask(), injected()],
  transports: { [monadTestnet.id]: http() },
  ssr: true,
});
