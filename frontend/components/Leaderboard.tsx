"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { SEESAW_ABI, SEESAW_ADDRESS } from "@/lib/contracts";
import { shortenAddress } from "@/lib/utils";

interface Entry {
  address: string;
  amount: bigint;
}

interface LeaderboardData {
  topCreators: Entry[];
  topSupporters: Entry[];
  topHaters: Entry[];
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData>({
    topCreators: [],
    topSupporters: [],
    topHaters: [],
  });
  const [loading, setLoading] = useState(true);

  const { data: contentCount } = useReadContract({
    address: SEESAW_ADDRESS,
    abi: SEESAW_ABI,
    functionName: "contentCount",
    query: { refetchInterval: 10000 },
  });

  useEffect(() => {
    if (contentCount === undefined) return;
    aggregateLeaderboard(Number(contentCount)).then(setData).finally(() => setLoading(false));
  }, [contentCount]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <LeaderboardSection
        title="Top Creators"
        emoji="🏆"
        entries={data.topCreators}
        valueLabel="MON earned"
        color="#8a58ee"
      />
      <LeaderboardSection
        title="Top Supporters"
        emoji="👍"
        entries={data.topSupporters}
        valueLabel="MON backed"
        color="#10b981"
      />
      <LeaderboardSection
        title="Top Haters"
        emoji="👎"
        entries={data.topHaters}
        valueLabel="MON wagered"
        color="#ef4444"
      />
    </div>
  );
}

function LeaderboardSection({
  title,
  emoji,
  entries,
  valueLabel,
  color,
}: {
  title: string;
  emoji: string;
  entries: Entry[];
  valueLabel: string;
  color: string;
}) {
  if (entries.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <span>{emoji}</span> {title}
        </h3>
        <p className="text-xs text-gray-600 italic">No activity yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 font-display">
        <span>{emoji}</span> {title}
      </h3>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={entry.address}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5"
          >
            <span
              className="text-sm font-bold w-6 text-center"
              style={{ color: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : "#b45309" }}
            >
              #{i + 1}
            </span>
            <span className="text-xs text-gray-300 flex-1 font-mono">
              {shortenAddress(entry.address)}
            </span>
            <span className="text-xs font-medium" style={{ color }}>
              {parseFloat(formatEther(entry.amount)).toFixed(4)} {valueLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function aggregateLeaderboard(count: number): Promise<LeaderboardData> {
  // In production, this would query indexed events. For hackathon, we return empty stubs.
  // The data would come from a subgraph or event indexer watching Settled/Voted events.
  return { topCreators: [], topSupporters: [], topHaters: [] };
}
