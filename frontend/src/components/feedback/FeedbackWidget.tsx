"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RATINGS = [
  { value: "love", emoji: "😍", label: "I love it" },
  { value: "good", emoji: "🙂", label: "Pretty good" },
  { value: "meh", emoji: "😐", label: "Just okay" },
  { value: "off", emoji: "🤔", label: "Doesn't fit" },
];

interface Props {
  chineseName: string;
}

export default function FeedbackWidget({ chineseName }: Props) {
  const [rating, setRating] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          chineseName,
          source: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });
      if (!res.ok) throw new Error("Bad response");
      setSubmitted(true);
    } catch {
      setError("Couldn't save your feedback — try once more?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      id="feedback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/80 p-7 backdrop-blur"
    >
      {/* corner decoration */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-3 select-none text-[6rem] font-bold leading-none text-stone-100"
        style={{ fontFamily: "'Noto Serif SC', serif" }}
      >
        言
      </span>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative flex items-center gap-4"
          >
            <span className="text-3xl">🙏</span>
            <div>
              <h3 className="text-lg font-semibold text-stone-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Thank you — we read every one.
              </h3>
              <p className="text-sm text-stone-500">
                Your note went straight to our studio inbox. It shapes the next round of names.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="flex items-baseline justify-between">
              <h3
                className="text-lg font-semibold text-stone-900"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                How does <span className="italic text-stone-700">{chineseName}</span> feel?
              </h3>
              <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400">
                30 seconds
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Your honest reaction is the only way we get better at this.
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRating(r.value)}
                  className={`group flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${
                    rating === r.value
                      ? "border-amber-400 bg-amber-50 text-stone-900"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                    {r.emoji}
                  </span>
                  <span className="leading-tight">{r.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="One line on what worked or didn't… (optional)"
              maxLength={500}
              rows={2}
              className="mt-4 w-full resize-none rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />

            {error && (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Sent privately — no email needed.
              </span>
              <button
                type="submit"
                disabled={!rating || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-stone-800 disabled:opacity-40"
              >
                {submitting ? "Sending…" : "Send"}
                {!submitting && <span aria-hidden>→</span>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
