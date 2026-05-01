"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Play, RotateCcw } from "lucide-react";

import type HanziWriterType from "hanzi-writer";

interface Props {
  chineseName: string;
}

type State = "idle" | "loading" | "playing" | "recording" | "done" | "unsupported";

const CHAR_SIZE = 160;
const CHAR_GAP = 24;
const STROKE_SPEED = 1.0;
const DELAY_BETWEEN_STROKES = 90;
const DELAY_BETWEEN_CHARACTERS = 280;
const TAIL_HOLD_MS = 1200;
// Characters appear on red squares, like a calligraphy worksheet
const PAPER_BG = "#fdf6e6";
const PAPER_GRID = "rgba(60, 38, 22, 0.08)";

export default function NameBrushVideo({ chineseName }: Props) {
  const [state, setState] = useState<State>("idle");
  const [hasMissing, setHasMissing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<HanziWriterType[]>([]);
  const writerSlotsRef = useRef<HTMLDivElement[]>([]);
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
      writerSlotsRef.current = [];
      let missingAny = false;

      for (const ch of characters) {
        const slot = document.createElement("div");
        slot.style.flex = "0 0 auto";
        slot.style.width = `${CHAR_SIZE}px`;
        slot.style.height = `${CHAR_SIZE}px`;
        containerRef.current.appendChild(slot);
        writerSlotsRef.current.push(slot);

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

  // Plays each character's stroke animation in order on the existing
  // hanzi-writer slots. Returns a promise that resolves when fully done.
  const playAnimations = async (onTick?: () => void) => {
    for (const w of writersRef.current) {
      w.hideCharacter();
      await new Promise<void>((resolve) => {
        try {
          // Drive a rAF loop while playing, so the recorder/composite
          // gets every frame regardless of hanzi-writer's internal timing.
          let stillRunning = true;
          const tick = () => {
            if (!stillRunning) return;
            onTick?.();
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          w.animateCharacter({
            onComplete: () => {
              stillRunning = false;
              onTick?.();
              resolve();
            },
          });
        } catch {
          resolve();
        }
      });
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CHARACTERS));
    }
  };

  const playAll = async () => {
    if (state === "playing" || state === "loading" || state === "recording") return;
    setState("playing");
    await playAnimations();
    setState("done");
  };

  // Build a composite off-screen canvas and record each frame via MediaRecorder.
  const downloadVideo = async () => {
    if (state === "loading" || state === "playing" || state === "recording") return;
    if (typeof window === "undefined") return;
    if (typeof MediaRecorder === "undefined") {
      // Older Safari can't record canvas streams reliably
      alert("Your browser doesn't support video export. Try Chrome, Edge, or Firefox.");
      return;
    }

    setState("recording");

    const widthPx = characters.length * CHAR_SIZE + (characters.length - 1) * CHAR_GAP + 80;
    const heightPx = CHAR_SIZE + 80;

    const composite = document.createElement("canvas");
    // Hi-DPI for sharp video
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    composite.width = widthPx * dpr;
    composite.height = heightPx * dpr;
    const ctx = composite.getContext("2d");
    if (!ctx) {
      setState("idle");
      return;
    }
    ctx.scale(dpr, dpr);

    const drawFrame = () => {
      // Paper background
      ctx.fillStyle = PAPER_BG;
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Faint vertical column lines for that calligraphy-paper feel
      ctx.fillStyle = PAPER_GRID;
      for (let i = 0; i <= characters.length; i++) {
        const x = 40 + i * (CHAR_SIZE + CHAR_GAP) - CHAR_GAP / 2;
        ctx.fillRect(x, 20, 1, heightPx - 40);
      }

      // Draw each writer's inner canvas onto the composite at its slot
      const slots = writerSlotsRef.current;
      slots.forEach((slot, idx) => {
        const inner = slot.querySelector("canvas") as HTMLCanvasElement | null;
        if (!inner) return;
        const dx = 40 + idx * (CHAR_SIZE + CHAR_GAP);
        const dy = 40;
        ctx.drawImage(inner, dx, dy, CHAR_SIZE, CHAR_SIZE);
      });
    };

    // Pick the best supported codec
    const mimeOptions = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    const supportedMime = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

    const stream = composite.captureStream(30);
    const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.start();

    // Drive an animation frame while writers are playing
    let raf = 0;
    const renderLoop = () => {
      drawFrame();
      raf = requestAnimationFrame(renderLoop);
    };
    raf = requestAnimationFrame(renderLoop);

    // Render an empty paper for ~400ms so the video has a clean intro
    drawFrame();
    await new Promise((r) => setTimeout(r, 400));

    await playAnimations();
    // Hold the final frame for a beat so the video ends on the full name
    await new Promise((r) => setTimeout(r, TAIL_HOLD_MS));

    cancelAnimationFrame(raf);
    drawFrame();
    recorder.stop();
    await stopped;

    const isMp4 = supportedMime.startsWith("video/mp4");
    const blob = new Blob(chunks, { type: supportedMime || "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chineseName}_brushstroke.${isMp4 ? "mp4" : "webm"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);

    setState("done");
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
            Each character drawn stroke-by-stroke, in the correct order. Download
            it as a video to share on TikTok or Instagram.
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
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={playAll}
            disabled={state === "loading" || state === "playing" || state === "recording"}
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

          <motion.button
            type="button"
            onClick={downloadVideo}
            disabled={state === "loading" || state === "playing" || state === "recording"}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #1f1410 0%, #3a2a1f 100%)",
              boxShadow: "0 8px 24px -12px rgba(31, 20, 16, 0.5)",
            }}
          >
            {state === "recording" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recording…</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download video</span>
              </>
            )}
          </motion.button>
        </div>
        {hasMissing && (
          <p className="text-[11px] text-amber-700/80">
            Stroke data isn&apos;t available for one of these characters; that
            slot is left blank.
          </p>
        )}
        <p className="text-[11px] text-stone-400">
          Free preview here. Higher-resolution MP4 + watermark-free comes with the{" "}
          <a href="#premium-upgrade" className="text-amber-700 underline-offset-2 hover:underline">
            Signature Collection
          </a>
          .
        </p>
      </div>
    </div>
  );
}
