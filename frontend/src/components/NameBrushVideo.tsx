"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Play, RotateCcw, Sparkles } from "lucide-react";

import type HanziWriterType from "hanzi-writer";

import { PAID_PLANS } from "@/lib/pricing";

interface Props {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

type State = "idle" | "loading" | "playing" | "done" | "unsupported";

const CHAR_SIZE = 160;
const STROKE_SPEED = 1.0;
const DELAY_BETWEEN_STROKES = 90;
const DELAY_BETWEEN_CHARACTERS = 280;

const SIGNATURE = PAID_PLANS.find((p) => p.id === "signature");

// Brush video is preview-only on the public result page. The clean MP4 is
// part of the Signature Collection and is delivered out-of-band by email
// (see frontend/src/lib/server/email-template.ts). Anything visible here
// gets a CSS watermark overlay so a screen-recording also carries it.
export default function NameBrushVideo({
  chineseName,
  pinyin,
  meaning,
  classicalAllusion,
}: Props) {
  const [state, setState] = useState<State>("idle");
  const [hasMissing, setHasMissing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<HanziWriterType[]>([]);
  const characters = [...chineseName];

  useEffect(() => {
    let cancelled = false;
    let HanziWriter: typeof HanziWriterType | null = null;

    const init = async () => {
      setState("loading");
      try {
        const mod = await import("hanzi-writer");
        if (cancelled) return;
        HanziWriter = mod.default;
      } catch {
        setState("unsupported");
        return;
      }

      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      writersRef.current = [];
      let missingAny = false;

      for (const ch of characters) {
        const slot = document.createElement("div");
        slot.style.flex = "0 0 auto";
        slot.style.width = `${CHAR_SIZE}px`;
        slot.style.height = `${CHAR_SIZE}px`;
        containerRef.current.appendChild(slot);

        try {
          const w = HanziWriter.create(slot, ch, {
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            padding: 10,
            strokeColor: "#1f1410",
            outlineColor: "#dcd1bd",
            radicalColor: undefined,
            strokeAnimationSpeed: STROKE_SPEED,
            delayBetweenStrokes: DELAY_BETWEEN_STROKES,
            showOutline: true,
            showCharacter: false,
            renderer: "canvas",
          });
          writersRef.current.push(w);
        } catch {
          missingAny = true;
        }
      }
      if (!cancelled) {
        setHasMissing(missingAny);
        setState("idle");
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chineseName]);

  const playAll = async () => {
    if (state === "playing" || state === "loading") return;
    setState("playing");
    for (const w of writersRef.current) {
      w.hideCharacter();
      await new Promise<void>((resolve) => {
        try {
          w.animateCharacter({ onComplete: () => resolve() });
        } catch {
          resolve();
        }
      });
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CHARACTERS));
    }
    setState("done");
  };

  const goToSignatureCheckout = () => {
    if (!SIGNATURE?.checkoutUrl) return;
    const url = new URL(SIGNATURE.checkoutUrl);
    url.searchParams.set("chinese_name", chineseName);
    url.searchParams.set("pinyin", pinyin);
    url.searchParams.set("meaning", meaning);
    if (classicalAllusion) url.searchParams.set("classical_allusion", classicalAllusion);
    window.location.href = url.toString();
  };

  if (state === "unsupported") return null;

  const cta = state === "loading"
    ? "Wetting the brush..."
    : state === "playing"
      ? "Brushing..."
      : state === "done"
        ? "Replay"
        : "Watch the brush";

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-6 backdrop-blur md:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
            笔触 — Watch It Written
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Each character drawn stroke-by-stroke, in the correct order. The
            clean, share-ready MP4 comes with the Signature Collection.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#fdf6e6] to-[#f0e2c2] py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(140,100,60,0.12) 0, transparent 40%)," +
              "radial-gradient(circle at 80% 70%, rgba(140,100,60,0.10) 0, transparent 40%)",
          }}
        />
        <div
          ref={containerRef}
          className="relative flex items-center justify-center gap-6"
          style={{ minHeight: CHAR_SIZE + 16 }}
        />

        {/* Watermark overlay — sits above the writers so screen-recording
            also captures it. Pointer-events disabled so it never blocks
            playback or interaction. */}
        <PreviewWatermark />
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={playAll}
            disabled={state === "loading" || state === "playing"}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-stone-300/80 bg-white/80 pl-3 pr-5 text-sm text-stone-700 backdrop-blur transition-all duration-300 hover:border-amber-400 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.35)] disabled:opacity-60"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)" }}
            >
              {state === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : state === "done" ? (
                <RotateCcw className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 translate-x-[1px]" />
              )}
            </span>
            <span className="font-medium tracking-tight">{cta}</span>
          </motion.button>

          {SIGNATURE && (
            <motion.button
              type="button"
              onClick={goToSignatureCheckout}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              className="group inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                boxShadow: "0 14px 32px -14px rgba(162, 36, 25, 0.55)",
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Get clean MP4 — {SIGNATURE.priceLabel}</span>
            </motion.button>
          )}
        </div>
        {hasMissing && (
          <p className="text-[11px] text-amber-700/80">
            Stroke data isn&apos;t available for one of these characters; that
            slot is left blank.
          </p>
        )}
        <p className="text-[11px] text-stone-400">
          Watermarked preview. The clean, share-ready MP4 (TikTok / IG-ready)
          arrives by email with the{" "}
          <a href="#premium-upgrade" className="text-amber-700 underline-offset-2 hover:underline">
            Signature Collection
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function PreviewWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1"
      style={{
        // Subtle but unmistakable. Diagonal repeat ensures any screen
        // recording — at any crop — picks the watermark up.
        transform: "rotate(-18deg)",
      }}
    >
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="whitespace-nowrap"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            color: "rgba(162, 36, 25, 0.28)",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          PREVIEW · INK&nbsp;NAME · PREVIEW · INK&nbsp;NAME · PREVIEW
        </div>
      ))}
    </div>
  );
}
