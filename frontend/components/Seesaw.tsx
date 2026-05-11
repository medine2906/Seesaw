"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatMON } from "@/lib/utils";

interface SeesawProps {
  posPool: bigint;
  negPool: bigint;
  tiltRatio: number; // -100 to +100
  size?: "sm" | "md" | "lg";
  settled?: boolean;
}

const SIZE_MAP = {
  sm: { width: 180, height: 100, pivotY: 76, beamY: 52, beamW: 140, weightR: 10, fontSize: 9 },
  md: { width: 260, height: 140, pivotY: 108, beamY: 74, beamW: 200, weightR: 14, fontSize: 11 },
  lg: { width: 360, height: 180, pivotY: 142, beamY: 96, beamW: 280, weightR: 18, fontSize: 13 },
};

export default function SeesawComponent({
  posPool,
  negPool,
  tiltRatio,
  size = "md",
  settled = false,
}: SeesawProps) {
  const prev = useRef(tiltRatio);
  const [bounce, setBounce] = useState(false);
  const d = SIZE_MAP[size];

  // Clamp tilt to ±45 degrees
  const targetAngle = (tiltRatio / 100) * 45;

  const springAngle = useSpring(targetAngle, {
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  });

  useEffect(() => {
    if (prev.current !== tiltRatio) {
      prev.current = tiltRatio;
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 600);
      return () => clearTimeout(t);
    }
  }, [tiltRatio]);

  useEffect(() => {
    springAngle.set(targetAngle);
  }, [targetAngle, springAngle]);

  // Weight positions at rest (on the beam, relative to pivot)
  const halfBeam = d.beamW / 2;
  // Left weight (positive / thumbs up) = positive side
  const leftX = d.width / 2 - halfBeam * 0.7;
  // Right weight (negative / thumbs down) = negative side
  const rightX = d.width / 2 + halfBeam * 0.7;
  const weightY = d.beamY - d.weightR - 2;

  const posLabel = posPool > 0n ? `${formatMON(posPool, 3)} MON` : "0 MON";
  const negLabel = negPool > 0n ? `${formatMON(negPool, 3)} MON` : "0 MON";

  return (
    <div className="flex flex-col items-center select-none">
      <motion.div
        animate={bounce ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg
          width={d.width}
          height={d.height}
          viewBox={`0 0 ${d.width} ${d.height}`}
          className="overflow-visible"
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow-pos" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-neg" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-pivot">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a97bf5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Ground line */}
          <line
            x1={d.width / 2 - 20}
            y1={d.pivotY + 8}
            x2={d.width / 2 + 20}
            y2={d.pivotY + 8}
            stroke="#333"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Pivot triangle */}
          <polygon
            points={`
              ${d.width / 2 - 14},${d.pivotY + 6}
              ${d.width / 2 + 14},${d.pivotY + 6}
              ${d.width / 2},${d.beamY + 4}
            `}
            fill="#8a58ee"
            opacity={0.85}
            filter="url(#glow-pivot)"
          />

          {/* Rotating beam group */}
          <motion.g
            style={{
              rotate: springAngle,
              originX: `${d.width / 2}px`,
              originY: `${d.beamY}px`,
            }}
          >
            {/* Beam */}
            <rect
              x={d.width / 2 - d.beamW / 2}
              y={d.beamY - 4}
              width={d.beamW}
              height={8}
              rx={4}
              fill="url(#beamGrad)"
              opacity={0.9}
            />

            {/* Left weight (positive 👍) */}
            <circle
              cx={leftX}
              cy={weightY}
              r={d.weightR}
              fill="#10b981"
              opacity={posPool > 0n ? 1 : 0.3}
              filter={posPool > 0n ? "url(#glow-pos)" : undefined}
            />
            <text
              x={leftX}
              y={weightY + 5}
              textAnchor="middle"
              fontSize={d.weightR * 1.1}
              className="select-none"
            >
              👍
            </text>

            {/* Right weight (negative 👎) */}
            <circle
              cx={rightX}
              cy={weightY}
              r={d.weightR}
              fill="#ef4444"
              opacity={negPool > 0n ? 1 : 0.3}
              filter={negPool > 0n ? "url(#glow-neg)" : undefined}
            />
            <text
              x={rightX}
              y={weightY + 5}
              textAnchor="middle"
              fontSize={d.weightR * 1.1}
              className="select-none"
            >
              👎
            </text>
          </motion.g>

          {/* Settled overlay */}
          {settled && (
            <text
              x={d.width / 2}
              y={d.height - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#8a58ee"
              opacity={0.7}
              fontFamily="Inter, sans-serif"
            >
              SETTLED
            </text>
          )}
        </svg>
      </motion.div>

      {/* Pool labels */}
      <div className="flex items-center justify-between w-full mt-1 px-2">
        <span
          className="text-xs font-medium"
          style={{ color: "#10b981", minWidth: 60 }}
        >
          {posLabel}
        </span>
        <span className="text-xs text-gray-500">
          {tiltRatio > 0
            ? `+${tiltRatio}% pos`
            : tiltRatio < 0
            ? `${tiltRatio}% neg`
            : "Even"}
        </span>
        <span
          className="text-xs font-medium text-right"
          style={{ color: "#ef4444", minWidth: 60 }}
        >
          {negLabel}
        </span>
      </div>
    </div>
  );
}
