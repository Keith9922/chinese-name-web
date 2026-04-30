"use client";

import { motion } from "framer-motion";

interface InkBackdropProps {
  intensity?: "soft" | "rich";
  className?: string;
}

const DRIFTING_CHARACTERS = [
  "名", "墨", "之", "心", "山", "水", "风", "月", "雅", "宁", "若", "知", "安", "清", "和", "真",
];

export default function InkBackdrop({ intensity = "soft", className = "" }: InkBackdropProps) {
  const opacity = intensity === "rich" ? 0.18 : 0.1;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Rice paper base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, #fbf2e2 0%, transparent 55%)," +
            "radial-gradient(ellipse at 80% 100%, #f4e8d0 0%, transparent 55%)," +
            "linear-gradient(180deg, #fbf6ee 0%, #f6efe1 100%)",
        }}
      />

      {/* Subtle paper grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18] mix-blend-multiply">
        <filter id="paperNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0.4 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperNoise)" />
      </svg>

      {/* Large ink wash blots */}
      <div
        className="absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(162, 36, 25, 0.35), transparent 70%)" }}
      />
      <div
        className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(184, 134, 11, 0.32), transparent 70%)" }}
      />

      {/* Drifting characters */}
      <div className="absolute inset-0">
        {DRIFTING_CHARACTERS.map((char, i) => {
          const top = (i * 17 + 5) % 90;
          const left = (i * 23 + 7) % 95;
          const size = 60 + (i * 11) % 110;
          const duration = 28 + (i % 6) * 4;
          const delay = (i * 0.7) % 8;
          return (
            <motion.span
              key={i}
              className="absolute select-none font-bold"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                fontSize: size,
                opacity,
                color: "#3a2a1f",
                fontFamily: "'Noto Serif SC', serif",
                writingMode: i % 3 === 0 ? "vertical-rl" : "horizontal-tb",
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [opacity * 0.6, opacity, opacity * 0.6],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </div>

      {/* Vertical column rule like a hanging scroll */}
      <div
        className="absolute right-[6%] top-0 hidden h-full w-px md:block"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(58, 42, 31, 0.18) 20%, rgba(58, 42, 31, 0.18) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}
