"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import MagneticWrap from "@/components/shared/MagneticWrap";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const ROTATING_SAMPLES = [
  { en: "Emma", zh: "苏雅琳", py: "Sū Yǎ Lín" },
  { en: "Michael", zh: "麦瑞文", py: "Mài Ruì Wén" },
  { en: "Sophia", zh: "苏蘅" },
  { en: "Alex", zh: "艾澈" },
  { en: "Lily", zh: "黎清岚" },
];

export default function HeroInk() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const tx = useTransform(sx, (v) => v * 12);
  const ty = useTransform(sy, (v) => v * 12);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSampleIdx((i) => (i + 1) % ROTATING_SAMPLES.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mx.set((e.clientX - cx) / rect.width);
      my.set((e.clientY - cy) / rect.height);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [mx, my]);

  const sample = ROTATING_SAMPLES[sampleIdx];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen px-4 pt-32 pb-20 md:pb-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.05fr_1fr]">
        {/* Left — Copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/60 px-3.5 py-1.5 text-xs tracking-[0.2em] text-stone-600 backdrop-blur"
          >
            <span
              className="grid h-4 w-4 place-items-center rounded-full text-[10px] text-white"
              style={{ background: "#a32419" }}
            >
              印
            </span>
            <span className="uppercase">A name written in ink</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.05] tracking-tight text-stone-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your name,
            <br />
            rewritten in{" "}
            <span className="relative inline-block">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #c2392c 0%, #a32419 40%, #6f1410 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ink
              </span>
              {/* underline brushstroke */}
              <svg
                className="absolute -bottom-3 left-0 h-3 w-full"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 8 C 40 2, 80 11, 120 6 S 190 9, 198 5"
                  stroke="#a32419"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-stone-600"
          >
            <span className="block font-medium text-stone-800">
              A name five thousand years in the making, waiting for you.
            </span>
            <span className="mt-2 block">
              Chosen by sound, by season, and by the five elements — composed in
              three minutes, written for life.
            </span>
          </motion.p>

          {/* Rotating sample */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-8 flex items-baseline gap-3 text-stone-500"
          >
            <span className="text-sm uppercase tracking-[0.2em]">Try:</span>
            <span
              key={sample.en}
              className="text-lg italic text-stone-700"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {sample.en}
            </span>
            <span className="text-stone-400">→</span>
            <motion.span
              key={sample.zh}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl font-semibold text-stone-900"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {sample.zh}
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticWrap strength={10}>
              <Link
                href="/generate"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-base font-medium text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                  boxShadow: "0 14px 40px -16px rgba(162, 36, 25, 0.6)",
                }}
              >
                {/* Shimmer sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
                />
                <span className="relative">Find my Chinese name</span>
                <span
                  className="relative grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </MagneticWrap>

            <a
              href="#examples"
              className="text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
            >
              See real names →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 flex items-center gap-5 text-xs text-stone-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {isSupabaseConfigured() ? "Free · one-click sign-in" : "Free · no signup"}
            </span>
            <span>~30 seconds</span>
            <span>八字 + 五行 informed</span>
          </motion.div>
        </div>

        {/* Right — Calligraphy art */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto h-[460px] w-full max-w-[460px] md:h-[560px]"
          style={{ perspective: 1000 }}
        >
          {/* Hanging scroll backdrop */}
          <motion.div
            style={{ x: tx, y: ty }}
            className="absolute inset-x-6 top-0 bottom-6 rounded-md"
          >
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background:
                  "linear-gradient(180deg, #f9efd9 0%, #f3e4c2 100%)",
                boxShadow:
                  "0 30px 80px -30px rgba(75, 50, 30, 0.45), inset 0 0 0 1px rgba(140, 100, 60, 0.18)",
              }}
            />
            {/* Top and bottom dowels */}
            <div
              className="absolute -top-2 left-0 right-0 h-3 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #6f4422 0%, #3d2715 100%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            />
            <div
              className="absolute -bottom-2 left-0 right-0 h-3 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #6f4422 0%, #3d2715 100%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            />

            {/* Inner ruling lines */}
            <div className="absolute inset-3 rounded-sm border border-amber-700/15" />
          </motion.div>

          {/* The 名 character */}
          <motion.div
            style={{ x: useTransform(sx, (v) => v * -22), y: useTransform(sy, (v) => v * -22) }}
            className="absolute inset-0 grid place-items-center"
          >
            <BrushStrokeCharacter />
          </motion.div>

          {/* Pinyin caption */}
          <motion.div
            style={{ x: useTransform(sx, (v) => v * -8), y: useTransform(sy, (v) => v * -8) }}
            className="absolute bottom-12 left-0 right-0 text-center"
          >
            <p
              className="text-xs uppercase tracking-[0.4em] text-stone-500"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              míng — the name
            </p>
          </motion.div>

          {/* Red seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-10 top-12"
            style={{ x: tx, y: ty }}
          >
            <RedSeal />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-stone-400">
          Scroll · 卷
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto mt-2 h-5 w-px bg-stone-400"
        />
      </motion.div>
    </section>
  );
}

function BrushStrokeCharacter() {
  // Ink-soak reveal: a clip rectangle grows from the top-left diagonal,
  // re-creating the moment a wet brush deposits ink onto rice paper.
  return (
    <svg
      viewBox="0 0 240 280"
      className="h-[88%] w-auto"
      style={{ filter: "drop-shadow(0 30px 30px rgba(58, 30, 18, 0.25))" }}
    >
      <defs>
        <linearGradient id="inkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1410" />
          <stop offset="100%" stopColor="#4a2f20" />
        </linearGradient>
        <clipPath id="inkReveal">
          <motion.rect
            x="0"
            y="0"
            width="240"
            height="280"
            initial={{ scaleX: 0, scaleY: 0 }}
            animate={{ scaleX: 1, scaleY: 1 }}
            transition={{
              scaleX: { duration: 2.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              scaleY: { duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            style={{ originX: 0, originY: 0 }}
          />
        </clipPath>
      </defs>
      {/* Faint outline so the negative space hints at the character before reveal */}
      <text
        x="120"
        y="200"
        textAnchor="middle"
        fontSize="240"
        fontWeight="700"
        fill="none"
        stroke="rgba(58, 30, 18, 0.08)"
        strokeWidth="1.5"
        fontFamily="'Noto Serif SC', serif"
        style={{ letterSpacing: "-0.05em" }}
      >
        名
      </text>
      {/* The character revealed by the clip mask */}
      <g clipPath="url(#inkReveal)">
        <text
          x="120"
          y="200"
          textAnchor="middle"
          fontSize="240"
          fontWeight="700"
          fill="url(#inkGrad)"
          fontFamily="'Noto Serif SC', serif"
          style={{ letterSpacing: "-0.05em" }}
        >
          名
        </text>
      </g>
      {/* A small ink-drip blot near the lower curve, fading in at the end of the reveal */}
      <motion.circle
        cx="170"
        cy="218"
        r="3.5"
        fill="#1f1410"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.55, 0.35], scale: [0, 1.4, 1] }}
        transition={{ duration: 1.6, delay: 3.0, ease: "easeOut" }}
      />
    </svg>
  );
}

function RedSeal() {
  return (
    <svg width="74" height="74" viewBox="0 0 74 74" aria-hidden>
      <defs>
        <filter id="sealRoughen">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>
      <g filter="url(#sealRoughen)">
        <rect
          x="3"
          y="3"
          width="68"
          height="68"
          rx="4"
          fill="#b9251f"
          stroke="#7e1810"
          strokeWidth="2"
        />
        <text
          x="37"
          y="48"
          textAnchor="middle"
          fontSize="40"
          fontWeight="700"
          fill="#fbf2e2"
          fontFamily="'Noto Serif SC', serif"
        >
          名
        </text>
      </g>
    </svg>
  );
}
