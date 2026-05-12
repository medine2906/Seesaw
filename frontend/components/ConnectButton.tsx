"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { shortenAddress } from "@/lib/utils";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isPending) {
    return <div className="h-9 w-28 rounded-lg bg-surface animate-pulse" />;
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-sm">
          <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-gray-300">{shortenAddress(address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className="px-4 py-1.5 rounded-lg border border-monad/50 text-monad text-sm font-medium hover:bg-monad hover:text-white transition-all"
    >
      Connect MetaMask
    </button>
  );
}
