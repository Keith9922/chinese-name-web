"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface Props {
  chineseName: string;
}

interface StylePreset {
  id: string;
  zh: string;
  en: string;
  blurb: string;
  fontVar: string;
  /** When true, render as a vertical column of red seal squares instead of plain horizontal text. */
  seal?: boolean;
  /** When true, treat the style as not yet released and lock it behind premium. */
  premium?: boolean;
}

const STYLES: StylePreset[] = [
  {
    id: "kaishu",
    zh: "楷书",
    en: "Regular",
    blurb: "The reference style. Square, balanced, the form a Chinese child first learns to write.",
    fontVar: "var(--font-cjk)",
  },
  {
    id: "xingkai",
    zh: "行楷",
    en: "Brush",
    blurb: "Calligraphic brush — measured speed, the warmth of a real ink-stroke.",
    fontVar: "var(--font-cal-brush)",
  },
  {
    id: "xingshu",
    zh: "行书",
    en: "Running",
    blurb: "Strokes begin to flow into one another — the pace of casual elegance.",
    fontVar: "var(--font-cal-running)",
  },
  {
    id: "xingcao",
    zh: "行草",
    en: "Semi-cursive",
    blurb: "Dancing between regular and cursive — the script of confident hands.",
    fontVar: "var(--font-cal-semicursive)",
  },
  {
    id: "caoshu",
    zh: "草书",
    en: "Wild Cursive",
    blurb: "Pure motion. The form of poets who've stopped caring whether you can read it.",
    fontVar: "var(--font-cal-cursive)",
  },
  {
    id: "lishu",
    zh: "隶书",
    en: "Clerical",
    blurb: "The Han-dynasty official hand — flat horizontal sweeps, archaic dignity.",
    fontVar: "var(--font-cal-clerical)",
  },
  {
    id: "zhuanshu",
    zh: "篆书",
    en: "Seal",
    blurb:
      "The form found on imperial seals — characters carved into vermilion, archaic and authoritative. Stamped, never typed.",
    fontVar: "var(--font-cjk)",
    seal: true,
  },
  {
    id: "jiaguwen",
    zh: "甲骨文",
    en: "Oracle Bone",
    blurb:
      "The earliest Chinese writing — bone and shell oracles from the Shang dynasty. Coming soon, on the Heirloom tier.",
    fontVar: "var(--font-cjk)",
    premium: true,
  },
];

export default function CalligraphyStyles({ chineseName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = STYLES[activeIdx];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-6 backdrop-blur md:p-8">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
            书法体 — Calligraphy Styles
          </p>
          <p className="mt-1 text-sm text-stone-500">
            The same name, in seven historical hands. Tap any style to view it.
          </p>
        </div>
      </div>

      {/* Active showcase */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-b from-[#fdf6e6] to-[#f0e2c2] py-10 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 select-none text-[8rem] font-bold leading-none text-stone-300/30"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {active.zh}
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            {active.seal ? (
              <SealRender chineseName={chineseName} />
            ) : (
              <div
                className="text-[clamp(4rem,11vw,8rem)] font-bold leading-[1] text-stone-900"
                style={{
                  fontFamily: active.fontVar,
                  letterSpacing: active.id === "caoshu" ? "0.08em" : "0",
                }}
              >
                {chineseName}
              </div>
            )}
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <span
                className="text-sm uppercase tracking-[0.3em] text-amber-700/80"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {active.zh} · {active.en}
              </span>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-600">
                {active.blurb}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Style picker */}
      <div className="flex flex-wrap justify-center gap-2">
        {STYLES.map((style, idx) => {
          const isActive = idx === activeIdx;
          const isPremium = !!style.premium;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => !isPremium && setActiveIdx(idx)}
              disabled={isPremium}
              className={`group relative inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? "border-amber-400 bg-white text-stone-900 shadow-[0_4px_14px_-6px_rgba(162,36,25,0.3)]"
                  : isPremium
                    ? "cursor-not-allowed border-stone-200 bg-stone-100/60 text-stone-400"
                    : "border-stone-200 bg-white/60 text-stone-600 hover:border-stone-300 hover:bg-white"
              }`}
              style={{ fontFamily: isActive || !isPremium ? style.fontVar : undefined }}
            >
              <span className={`text-base ${isActive ? "font-bold" : ""}`}>{style.zh}</span>
              <span className="text-xs opacity-60" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                · {style.en}
              </span>
              {isPremium && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-stone-400">
        甲骨文 styles unlock with the upcoming Heirloom tier. High-resolution
        downloads of any visible style are available below.
      </p>
    </div>
  );
}

/**
 * Renders the name as a vertical seal column — red squares with white
 * characters, lightly distressed, like an actual 印章. Authentic seal-script
 * fonts aren't free, so we lean on the visual gestalt of a stamp instead.
 */
function SealRender({ chineseName }: { chineseName: string }) {
  const chars = [...chineseName];
  return (
    <div className="flex flex-col gap-1.5">
      {chars.map((ch, i) => (
        <SealCell key={i} character={ch} index={i} />
      ))}
    </div>
  );
}

function SealCell({ character, index }: { character: string; index: number }) {
  // Tiny per-cell rotation for hand-stamped feel
  const rot = ((index * 7) % 5) - 2;
  return (
    <div
      style={{
        width: "clamp(78px, 11vw, 130px)",
        height: "clamp(78px, 11vw, 130px)",
        background:
          "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
        borderRadius: "6px",
        boxShadow:
          "inset 0 0 0 4px #fbf2e2, inset 0 0 0 5px #7e1810, 0 12px 30px -12px rgba(126, 24, 16, 0.4)",
        display: "grid",
        placeItems: "center",
        transform: `rotate(${rot}deg)`,
        // Subtle texture-y darken in corners
        backgroundBlendMode: "multiply",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-cjk)",
          fontWeight: 700,
          fontSize: "clamp(46px, 7vw, 80px)",
          color: "#fbf2e2",
          lineHeight: 1,
          textShadow: "1px 1px 0 rgba(31, 7, 5, 0.35)",
        }}
      >
        {character}
      </span>
    </div>
  );
}
