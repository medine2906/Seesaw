"use client";

import { usePrivy } from "@privy-io/react-auth";
import { shortenAddress } from "@/lib/utils";

export default function ConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="h-9 w-28 rounded-lg bg-surface animate-pulse" />
    );
  }

  if (authenticated && user?.wallet?.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-sm">
          <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-gray-300">{shortenAddress(user.wallet.address)}</span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-1.5 rounded-lg border border-monad/50 text-monad text-sm font-medium hover:bg-monad hover:text-white transition-all"
    >
      Connect
    </button>
  );
}
