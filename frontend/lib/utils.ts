import { formatEther } from "viem";

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatMON(wei: bigint, decimals = 4): string {
  return parseFloat(formatEther(wei)).toFixed(decimals);
}

export type ContentType = "tweet" | "youtube" | "image" | "text";

export function detectContentType(uri: string): ContentType {
  if (/twitter\.com|x\.com/.test(uri)) return "tweet";
  if (/youtube\.com|youtu\.be/.test(uri)) return "youtube";
  if (/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(uri)) return "image";
  return "text";
}

export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function formatCountdown(settleAt: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (settleAt <= now) return "Settled";
  const diff = Number(settleAt - now);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export const DEMO_CONTENTS = [
  {
    id: "demo-0",
    uri: "https://twitter.com/VitalikButerin/status/1679527974750879746",
    type: "tweet" as ContentType,
  },
  {
    id: "demo-1",
    uri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    type: "youtube" as ContentType,
  },
  {
    id: "demo-2",
    uri: "Monad is the fastest EVM blockchain. Change my mind.",
    type: "text" as ContentType,
  },
];
