"use client";

import Link from "next/link";
import ConnectButton from "./ConnectButton";

interface HeaderProps {
  onSubmit?: () => void;
}

export default function Header({ onSubmit }: HeaderProps) {

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <SeesawLogo />
          <span
            className="text-xl font-bold tracking-tight text-white group-hover:text-monad transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Seesaw
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Feed
          </Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 rounded-lg bg-monad hover:bg-monad-dark text-white text-sm font-medium transition-all glow-monad"
            >
              + Submit
            </button>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

function SeesawLogo() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
      {/* Pivot */}
      <polygon points="10,18 18,18 14,13" fill="#8a58ee" opacity="0.9" />
      {/* Beam (slightly tilted) */}
      <rect
        x="2" y="10" width="24" height="4" rx="2"
        fill="url(#logoGrad)"
        transform="rotate(-8, 14, 12)"
        opacity="0.95"
      />
      {/* Left circle (pos) */}
      <circle cx="4" cy="8" r="3.5" fill="#10b981" opacity="0.9" />
      {/* Right circle (neg) */}
      <circle cx="24" cy="14" r="3.5" fill="#ef4444" opacity="0.9" />
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#8a58ee" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}
