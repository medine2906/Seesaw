import { monadTestnet } from "./wagmi";

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clxyz-placeholder";

export const privyConfig = {
  appId: PRIVY_APP_ID,
  config: {
    loginMethods: ["email", "google", "wallet"] as const,
    appearance: {
      theme: "dark" as const,
      accentColor: "#8a58ee" as `#${string}`,
      logo: "/seesaw-logo.svg",
    },
    embeddedWallets: {
      createOnLogin: "all-users" as const,
    },
    defaultChain: monadTestnet,
    supportedChains: [monadTestnet],
  },
};
