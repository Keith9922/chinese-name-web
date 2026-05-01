"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Play } from "lucide-react";

// Lazy import — hanzi-writer is browser-only and pulls a non-trivial bundle
import type HanziWriterType from "hanzi-writer";

interface Props {
  chineseName: string;
}

type State = "idle" | "loading" | "playing" | "done" | "unsupported";

const STROKE_SPEED = 1.0;
const DELAY_BETWEEN_STROKES = 90;
const DELAY_BETWEEN_CHARACTERS = 280;

export default function NameBrushVideo({ chineseName }: Props) {
  const [state, setState] = useState<State>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<HanziWriterType[]>([]);
  const characters = [...chineseName];

  // Mount: create one HanziWriter per character, paused on the outline.
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

      // Wipe any previous writers (re-render on name change)
      containerRef.current.innerHTML = "";
      writersRef.current = [];

      for (const ch of characters) {
        const slot = document.createElement("div");
        slot.style.flex = "0 0 auto";
        containerRef.current.appendChild(slot);

        try {
          const w = HanziWriter.create(slot, ch, {
            width: 140,
            height: 140,
            padding: 8,
            strokeColor: "#1f1410",
            outlineColor: "#dcd1bd",
            radicalColor: undefined,
            strokeAnimationSpeed: STROKE_SPEED,
            delayBetweenStrokes: DELAY_BETWEEN_STROKES,
            showOutline: true,
            showCharacter: false,
          });
          writersRef.current.push(w);
        } catch {
          // hanzi-writer doesn't have stroke data for some rare characters;
          // skip silently and keep the rest
        }
      }
      if (!cancelled) setState("idle");
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
      // hideCharacter resets so each replay starts from blank
      w.hideCharacter();
      // hanzi-writer's animateCharacter resolves on `onComplete`
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

  if (state === "unsupported") return null;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-6 backdrop-blur md:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
            笔触 — Watch It Written
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Each character drawn stroke-by-stroke, in the correct order. Perfect for
            sharing — or simply seeing the bones of your name.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#fdf6e6] to-[#f0e2c2] py-8">
        {/* Subtle paper grain */}
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
          style={{ minHeight: 156 }}
        />
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <motion.button
          type="button"
          onClick={playAll}
          disabled={state === "loading" || state === "playing"}
          whileTap={{ scale: 0.95 }}
          className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-stone-300/80 bg-white/80 pl-3 pr-5 text-sm text-stone-700 backdrop-blur transition-all duration-300 hover:border-amber-400 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.35)] disabled:opacity-60"
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
            }}
          >
            {state === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : state === "done" ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 translate-x-[1px]" />
            )}
          </span>
          <span className="font-medium tracking-tight">
            {state === "loading"
              ? "Wetting the brush..."
              : state === "playing"
                ? "Brushing..."
                : state === "done"
                  ? "Replay"
                  : "Watch the brush"}
          </span>
        </motion.button>
        <p className="text-[11px] text-stone-400">
          Downloadable MP4 of the brushstroke comes with the{" "}
          <a href="#premium-upgrade" className="text-amber-700 underline-offset-2 hover:underline">
            Signature Collection
          </a>
          .
        </p>
      </div>
    </div>
  );
}
