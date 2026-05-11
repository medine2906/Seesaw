"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useReadContract, useWatchContractEvent } from "wagmi";
import Header from "@/components/Header";
import ContentCard from "@/components/ContentCard";
import SubmitModal from "@/components/SubmitModal";
import SeesawComponent from "@/components/Seesaw";
import { SEESAW_ABI, SEESAW_ADDRESS } from "@/lib/contracts";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";
  const [submitOpen, setSubmitOpen] = useState(false);
  const [contentIds, setContentIds] = useState<bigint[]>([]);
  const [showQR, setShowQR] = useState(false);

  const { data: contentCount, refetch: refetchCount } = useReadContract({
    address: SEESAW_ADDRESS,
    abi: SEESAW_ABI,
    functionName: "contentCount",
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    if (contentCount === undefined) return;
    const count = Number(contentCount);
    // Show newest first
    const ids = Array.from({ length: count }, (_, i) => BigInt(count - 1 - i));
    setContentIds(ids);
  }, [contentCount]);

  // Listen for new ContentSubmitted events to auto-update feed
  useWatchContractEvent({
    address: SEESAW_ADDRESS,
    abi: SEESAW_ABI,
    eventName: "ContentSubmitted",
    onLogs: () => refetchCount(),
  });

  const isEmpty = contentIds.length === 0;

  return (
    <div className="min-h-screen bg-bg">
      <Header onSubmit={() => setSubmitOpen(true)} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero tagline (only when feed is empty) */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="flex justify-center mb-6">
              <SeesawComponent
                posPool={BigInt("30000000000000000")}
                negPool={BigInt("10000000000000000")}
                tiltRatio={50}
                size="lg"
              />
            </div>
            <h1
              className="text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Tilt the Internet.
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Every opinion has weight. Vote with 0.01 MON. Win or lose together.
            </p>
            <p className="text-gray-600 text-sm mb-8">
              Powered by Monad Testnet — real-time votes, &lt;1 second finality.
            </p>
            <button
              onClick={() => setSubmitOpen(true)}
              className="px-8 py-3 rounded-xl bg-monad hover:bg-monad-dark text-white font-medium text-lg glow-monad transition-all"
            >
              Submit the First Content
            </button>
          </motion.div>
        )}

        {/* Demo mode banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-monad/10 border border-monad/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-monad text-xl">🎮</span>
              <div>
                <p className="text-monad font-medium text-sm">Demo Mode Active</p>
                <p className="text-gray-500 text-xs">Voting period shortened to 60 seconds</p>
              </div>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-3 py-1.5 rounded-lg bg-monad/20 text-monad text-xs border border-monad/30 hover:bg-monad/40 transition-all"
            >
              {showQR ? "Hide QR" : "Show QR"}
            </button>
          </motion.div>
        )}

        {/* QR Code overlay */}
        <AnimatePresence>
          {isDemoMode && showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-8 rounded-2xl bg-white flex flex-col items-center gap-4"
            >
              <p className="text-black font-bold text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Scan to Vote Live
              </p>
              {/* Placeholder QR — replace with actual QR of your deployed URL */}
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-4 border-black">
                <QRPlaceholder />
              </div>
              <p className="text-gray-500 text-sm">seesaw.vercel.app</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content feed */}
        {!isEmpty && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {contentIds.map((id) => (
                <ContentCard key={id.toString()} contentId={id} isDemoMode={isDemoMode} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <SubmitModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSuccess={() => refetchCount()}
      />
    </div>
  );
}

function QRPlaceholder() {
  // Simple SVG QR-like pattern — replace with actual QR in production
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      {/* Top-left finder */}
      <rect x="10" y="10" width="50" height="50" rx="4" fill="black" />
      <rect x="18" y="18" width="34" height="34" rx="2" fill="white" />
      <rect x="26" y="26" width="18" height="18" rx="1" fill="black" />
      {/* Top-right finder */}
      <rect x="100" y="10" width="50" height="50" rx="4" fill="black" />
      <rect x="108" y="18" width="34" height="34" rx="2" fill="white" />
      <rect x="116" y="26" width="18" height="18" rx="1" fill="black" />
      {/* Bottom-left finder */}
      <rect x="10" y="100" width="50" height="50" rx="4" fill="black" />
      <rect x="18" y="108" width="34" height="34" rx="2" fill="white" />
      <rect x="26" y="116" width="18" height="18" rx="1" fill="black" />
      {/* Data modules (simplified) */}
      {[70, 80, 90, 100, 110, 120, 130].map((x) =>
        [70, 80, 90, 100, 110, 120, 130].map((y) =>
          (x + y) % 20 === 0 ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" rx="1" fill="black" />
          ) : null
        )
      )}
      {/* Center */}
      <text x="80" y="88" textAnchor="middle" fontSize="10" fill="#8a58ee" fontFamily="monospace">
        seesaw
      </text>
    </svg>
  );
}
