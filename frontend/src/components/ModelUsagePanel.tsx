"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ScrollText, XCircle } from "lucide-react";

export interface GmiCallLog {
  step: string;
  modality: "text" | "image" | "audio";
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  ok: boolean;
  error?: string;
  at: number;
}

const POLL_INTERVAL_MS = 2000;

// Turn a snake_case / step id like "generate_name_retry" into a warm,
// human sentence fragment. Falls back to a title-cased version of the raw
// step for anything not in the map, so a new step added elsewhere never
// renders as a raw identifier.
const STEP_LABELS: Record<string, string> = {
  generate_name: "Composing your name",
  generate_name_retry: "Refining your name",
  blessing: "Writing your blessing",
  calligraphy_image: "Painting the calligraphy",
  seal_image: "Carving the red seal",
  audio_narration: "Recording the pronunciation",
  tts: "Recording the pronunciation",
};

function humanizeStep(step: string): string {
  if (STEP_LABELS[step]) return STEP_LABELS[step];
  const words = step.replace(/[_-]+/g, " ").trim();
  if (!words) return "Working";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const MODALITY_LABELS: Record<GmiCallLog["modality"], string> = {
  text: "文 Text",
  image: "画 Image",
  audio: "声 Audio",
};

function formatLatency(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatModelName(model: string): string {
  // Model ids often look like "anthropic/claude-sonnet-4.6" or
  // "gemini-3.1-flash-image-preview" — keep the whole thing, it's the
  // point of the panel, but trim any org/provider prefix path noise.
  return model;
}

export default function ModelUsagePanel(): JSX.Element {
  const [calls, setCalls] = useState<GmiCallLog[]>([]);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchCalls = async () => {
      try {
        const res = await fetch("/api/model-usage", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { calls?: GmiCallLog[] };
        if (!mountedRef.current) return;
        if (Array.isArray(data.calls)) setCalls(data.calls);
      } catch {
        // Silent — this is a transparency nicety, not a critical path.
        // Keep whatever we last had rather than showing an error state.
      } finally {
        if (mountedRef.current) setHasFetchedOnce(true);
      }
    };

    fetchCalls();
    const id = window.setInterval(fetchCalls, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <section
      aria-label="Model transparency panel"
      className="w-full max-w-2xl mx-auto rounded-2xl border border-stone-200/80 bg-white/85 backdrop-blur px-6 py-6 md:px-8 md:py-7"
      style={{ boxShadow: "0 20px 60px -36px rgba(60, 38, 22, 0.25)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full"
          style={{ background: "linear-gradient(180deg, #fdf6e6 0%, #f0e2c2 100%)" }}
          aria-hidden
        >
          <ScrollText className="h-4 w-4" style={{ color: "#a32419" }} />
        </div>
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem" }}
          >
            How this was made
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Every step below is a real call to a specific GMI Cloud model — nothing here is a black box.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {calls.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-stone-300/70 bg-stone-50/60 px-4 py-6 text-center"
            >
              <p className="text-sm text-stone-500">
                {hasFetchedOnce
                  ? "Waiting quietly for the first call — begin your name to see it appear here."
                  : "Listening for model activity…"}
              </p>
            </motion.div>
          ) : (
            calls.map((call, idx) => (
              <motion.div
                key={`${call.at}-${call.step}-${idx}`}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-stone-200/70 bg-stone-50/50 px-4 py-3"
              >
                <span
                  className="grid h-2.5 w-2.5 flex-none place-items-center rounded-full"
                  aria-hidden
                >
                  {call.ok ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: "#3f7a4d" }} />
                  ) : (
                    <XCircle className="h-4 w-4" style={{ color: "#a32419" }} />
                  )}
                </span>

                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-medium text-stone-800">
                    {humanizeStep(call.step)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {formatModelName(call.model)}
                  </p>
                </div>

                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-stone-500"
                  style={{ background: "rgba(184, 134, 11, 0.1)" }}
                >
                  {MODALITY_LABELS[call.modality] ?? call.modality}
                </span>

                <span className="text-xs tabular-nums text-stone-500">
                  {formatLatency(call.latencyMs)}
                </span>

                {(call.promptTokens != null || call.completionTokens != null) && (
                  <span className="text-xs tabular-nums text-stone-400">
                    {call.promptTokens ?? "—"}
                    {" → "}
                    {call.completionTokens ?? "—"} tok
                  </span>
                )}

                {!call.ok && call.error && (
                  <span className="w-full text-xs text-[#a32419]/80">
                    {call.error}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
