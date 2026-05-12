"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { SEESAW_ABI, SEESAW_ADDRESS } from "@/lib/contracts";
import { detectContentType } from "@/lib/utils";

interface SubmitModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubmitModal({ open, onClose, onSuccess }: SubmitModalProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const [uri, setUri] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isSuccess && open) {
    onSuccess?.();
    onClose();
  }

  const contentType = uri.trim() ? detectContentType(uri.trim()) : null;

  const handleSubmit = () => {
    setError("");
    if (!isConnected) { connect({ connector: metaMask() }); return; }
    if (!uri.trim()) { setError("Enter a URL or text to submit."); return; }
    writeContract({
      address: SEESAW_ADDRESS,
      abi: SEESAW_ABI,
      functionName: "submitContent",
      args: [uri.trim()],
    });
  };

  const isLoading = isPending || isConfirming;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-bg-card border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white font-display">
                  Submit Content
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-white transition-colors text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Tweet URL, YouTube link, image URL, or plain text
                  </label>
                  <textarea
                    value={uri}
                    onChange={(e) => { setUri(e.target.value); setError(""); }}
                    placeholder="https://twitter.com/... or paste your take here"
                    rows={3}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-monad/60 transition-colors resize-none"
                  />
                  {contentType && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Detected:</span>
                      <span className="px-2 py-0.5 rounded-full bg-monad/20 text-monad capitalize">
                        {contentType}
                      </span>
                    </div>
                  )}
                  {error && (
                    <p className="mt-2 text-xs text-red-400">{error}</p>
                  )}
                </div>

                <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Submitting is <span className="text-white">free</span>. Others will vote 👍 or 👎 with 0.01 MON each.
                    If your content wins positive votes, you earn <span className="text-positive">80% of the pool</span>.
                    Supporters share 20%. If negative wins, haters split everything.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-monad hover:bg-monad-dark disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isConfirming ? "Confirming..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <span>Submit Content</span>
                      <span className="text-white/60 text-sm">(free)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
