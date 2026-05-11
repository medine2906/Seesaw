"use client";

import Header from "@/components/Header";
import Leaderboard from "@/components/Leaderboard";
import { useState } from "react";
import SubmitModal from "@/components/SubmitModal";

export default function LeaderboardPage() {
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Header onSubmit={() => setSubmitOpen(true)} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leaderboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Top performers on Seesaw — creators, supporters, and haters.
          </p>
        </div>
        <Leaderboard />
      </main>
      <SubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}
