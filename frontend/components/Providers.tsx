"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig, monadTestnet } from "@/lib/wagmi";

const queryClient = new QueryClient();
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clxyz-placeholder";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#8a58ee" as `#${string}`,
          logo: "/seesaw-logo.svg",
        },
        embeddedWallets: {
          createOnLogin: "all-users",
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
