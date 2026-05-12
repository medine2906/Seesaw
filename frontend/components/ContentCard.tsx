"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Tweet } from "react-tweet";
import SeesawComponent from "./Seesaw";
import { SEESAW_ABI, SEESAW_ADDRESS, VOTE_AMOUNT } from "@/lib/contracts";
import {
  detectContentType,
  extractTweetId,
  extractYouTubeId,
  formatCountdown,
  shortenAddress,
  formatMON,
} from "@/lib/utils";

interface ContentCardProps {
  contentId: bigint;
  isDemoMode?: boolean;
}

export default function ContentCard({ contentId, isDemoMode }: ContentCardProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const [votePending, setVotePending] = useState<"up" | "down" | null>(null);
  const [countdown, setCountdown] = useState("");
  const [justVoted, setJustVoted] = useState<"up" | "down" | null>(null);

  const { data: content, refetch } = useReadContract({
    address: SEESAW_ADDRESS,
    abi: SEESAW_ABI,
    functionName: "getContent",
    args: [contentId],
    query: { refetchInterval: 3000 },
  });

  const { data: tiltRatio } = useReadContract({
    address: SEESAW_ADDRESS,
    abi: SEESAW_ABI,
    functionName: "getTiltRatio",
    args: [contentId],
    query: { refetchInterval: 3000 },
  });

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      refetch();
      setJustVoted(votePending);
      setTimeout(() => setJustVoted(null), 2000);
      setVotePending(null);
    }
  }, [isSuccess, refetch, votePending]);

  // Countdown timer
  useEffect(() => {
    if (!content) return;
    const update = () => setCountdown(formatCountdown(content.settleAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [content]);

  const vote = (direction: "up" | "down") => {
    if (!isConnected) { connect({ connector: metaMask() }); return; }
    setVotePending(direction);
    writeContract({
      address: SEESAW_ADDRESS,
      abi: SEESAW_ABI,
      functionName: direction === "up" ? "voteUp" : "voteDown",
      args: [contentId],
      value: VOTE_AMOUNT,
    });
  };

  const settle = () => {
    writeContract({
      address: SEESAW_ADDRESS,
      abi: SEESAW_ABI,
      functionName: "settle",
      args: [contentId],
    });
  };

  if (!content) {
    return (
      <div className="gradient-border p-6 animate-pulse">
        <div className="h-4 bg-surface rounded w-3/4 mb-3" />
        <div className="h-32 bg-surface rounded mb-4" />
        <div className="h-24 bg-surface/50 rounded" />
      </div>
    );
  }

  const uri = content.metadataURI;
  const type = detectContentType(uri);
  const tweetId = type === "tweet" ? extractTweetId(uri) : null;
  const youtubeId = type === "youtube" ? extractYouTubeId(uri) : null;
  const isVoting = isWriting || isConfirming;
  const isExpired = BigInt(Math.floor(Date.now() / 1000)) >= content.settleAt;
  const ratio = Number(tiltRatio ?? 0n);
  const totalPool = content.posPool + content.negPool;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-5 relative overflow-hidden"
    >
      {/* Subtle background glow based on tilt */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none rounded-xl transition-all duration-1000"
        style={{
          background:
            ratio > 10
              ? "radial-gradient(ellipse at 20% 50%, #10b981, transparent 70%)"
              : ratio < -10
              ? "radial-gradient(ellipse at 80% 50%, #ef4444, transparent 70%)"
              : "transparent",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-0.5 rounded-full bg-surface border border-white/5 text-gray-400 uppercase tracking-wide text-[10px]">
            {type}
          </span>
          <span>by {shortenAddress(content.creator)}</span>
        </div>
        <div className="flex items-center gap-2">
          {content.settled ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-monad/20 text-monad border border-monad/30">
              Settled
            </span>
          ) : isExpired ? (
            <button
              onClick={settle}
              disabled={isVoting}
              className="text-xs px-3 py-1 rounded-full bg-monad/20 text-monad border border-monad/40 hover:bg-monad/40 transition-all"
            >
              Settle Now
            </button>
          ) : (
            <span className="text-xs text-gray-500 tabular-nums">{countdown}</span>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-5 rounded-lg overflow-hidden">
        {type === "tweet" && tweetId ? (
          <div className="[&_.react-tweet-theme]:bg-transparent [&_.react-tweet-theme]:border-0">
            <Tweet id={tweetId} />
          </div>
        ) : type === "youtube" && youtubeId ? (
          <div className="aspect-video rounded-lg overflow-hidden bg-surface">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : type === "image" ? (
          <img
            src={uri}
            alt="Content"
            className="w-full rounded-lg object-cover max-h-80"
          />
        ) : (
          <div className="p-5 bg-surface rounded-lg border border-white/5">
            <p className="text-gray-200 text-base leading-relaxed">{uri}</p>
          </div>
        )}
      </div>

      {/* THE SEESAW */}
      <div className="flex justify-center mb-5 py-2">
        <SeesawComponent
          posPool={content.posPool}
          negPool={content.negPool}
          tiltRatio={ratio}
          size="md"
          settled={content.settled}
        />
      </div>

      {/* Pool stats */}
      {totalPool > 0n && (
        <div className="flex justify-between text-xs text-gray-500 mb-4 px-1">
          <span>Total pool: <span className="text-gray-300">{formatMON(totalPool, 4)} MON</span></span>
          <span>
            {content.settled
              ? ratio > 0
                ? "Creator earned 80%"
                : "Haters won"
              : `${isExpired ? "Voting closed" : "Voting open"}`}
          </span>
        </div>
      )}

      {/* Vote buttons */}
      {!content.settled && (
        <div className="flex gap-3">
          <VoteButton
            direction="up"
            onClick={() => vote("up")}
            disabled={isVoting || isExpired}
            loading={votePending === "up" && isVoting}
            justVoted={justVoted === "up"}
          />
          <VoteButton
            direction="down"
            onClick={() => vote("down")}
            disabled={isVoting || isExpired}
            loading={votePending === "down" && isVoting}
            justVoted={justVoted === "down"}
          />
        </div>
      )}

      {/* Just voted confirmation */}
      <AnimatePresence>
        {justVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-monad text-white text-xs font-medium"
          >
            Vote cast! Seesaw updated ✓
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface VoteButtonProps {
  direction: "up" | "down";
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  justVoted: boolean;
}

function VoteButton({ direction, onClick, disabled, loading, justVoted }: VoteButtonProps) {
  const isPos = direction === "up";
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`
        flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
        font-medium text-sm transition-all border
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${isPos
          ? "bg-positive/10 border-positive/30 text-positive hover:bg-positive/20 hover:border-positive/60 hover:glow-positive"
          : "bg-negative/10 border-negative/30 text-negative hover:bg-negative/20 hover:border-negative/60 hover:glow-negative"
        }
        ${justVoted ? (isPos ? "glow-positive" : "glow-negative") : ""}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <span className="text-lg">{isPos ? "👍" : "👎"}</span>
          <span>{isPos ? "Vote Up" : "Vote Down"}</span>
          <span className="text-xs opacity-60">0.01 MON</span>
        </>
      )}
    </motion.button>
  );
}
