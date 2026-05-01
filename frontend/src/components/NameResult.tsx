"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import MarkdownText from "./MarkdownText";
import NamePronounce from "./NamePronounce";
import CalligraphyStyles from "./CalligraphyStyles";
import NameBrushVideo from "./NameBrushVideo";
import PremiumUnlock from "./PremiumUnlock";
import FeedbackWidget from "./feedback/FeedbackWidget";

interface NameResultProps {
  result: {
    chineseName: string;
    pinyin: string;
    meaning: string;
    culturalExplanation: string;
    pronunciationMapping: string;
    elementAnalysis: string;
    classicalAllusion?: string;
    suggestedCharacters: { character: string; meaning: string }[];
  };
  gender?: "male" | "female" | "other";
}

export default function NameResult({ result, gender }: NameResultProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const toStructuredMarkdown = (text: string) => {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return "";
    const sentences = normalized
      .split(/(?<=[.!?。])/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length <= 1) return normalized;
    return sentences.map((s) => `- ${s}`).join("\n");
  };

  const handleShare = async () => {
    const shareText = `My Chinese name is ${result.chineseName} (${result.pinyin}) — ${result.meaning}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Chinese Name", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 backdrop-blur"
        style={{ boxShadow: "0 30px 80px -40px rgba(60, 38, 22, 0.22)" }}
      >
        {/* Top dotted ornament rule */}
        <div
          aria-hidden
          className="absolute left-1/2 top-6 hidden h-px w-48 -translate-x-1/2 md:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(60,38,22,0.4) 1px, transparent 1.5px)",
            backgroundSize: "8px 1px",
          }}
        />

        <div className="relative px-6 py-12 md:px-12 md:py-16">
          {/* Hero name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-center"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
              你的中文名 — Your Chinese Name
            </p>

            <div className="relative mt-7">
              {/* Big name */}
              <motion.h2
                initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(4.5rem,12vw,9rem)] font-bold leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "'Noto Serif SC', serif",
                  color: "#1f1410",
                  textShadow: "0 8px 18px rgba(60, 38, 22, 0.18)",
                }}
              >
                {result.chineseName}
              </motion.h2>

              {/* Red seal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-[10%] top-1 md:right-[18%]"
              >
                <ResultSeal text={result.chineseName.slice(-1)} />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-xl tracking-[0.18em] text-stone-500"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {result.pinyin}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="mx-auto mt-3 max-w-md text-stone-700"
            >
              <span className="italic">“{result.meaning}”</span>
            </motion.p>

            {result.classicalAllusion && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mx-auto mt-5 max-w-xl"
              >
                <div className="relative inline-flex flex-col items-center gap-2 px-6 py-3">
                  {/* Decorative side rules */}
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-amber-700/30" />
                  <span className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-amber-700/30" />
                  <span
                    className="text-[10px] uppercase tracking-[0.4em] text-amber-700/70"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    典 · Classical Allusion
                  </span>
                  <p className="text-sm leading-relaxed text-stone-700 italic">
                    {result.classicalAllusion}
                  </p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
            >
              <NamePronounce
                chineseName={result.chineseName}
                pinyin={result.pinyin}
                gender={gender}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              <Tag>Sound-matched</Tag>
              <Tag>Birth-profile tuned</Tag>
              <Tag>Keepsake-ready</Tag>
            </motion.div>
          </motion.div>

          {/* Character breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="mt-14"
          >
            <p className="text-center text-xs uppercase tracking-[0.3em] text-stone-500">
              字解 — Character Breakdown
            </p>
            <div className="mt-7 flex flex-wrap items-start justify-center gap-8 md:gap-14">
              {result.suggestedCharacters.map((char, idx) => (
                <motion.div
                  key={`${char.character}-${idx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + idx * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="grid h-24 w-24 place-items-center rounded-md text-5xl font-bold text-stone-900"
                    style={{
                      background:
                        "linear-gradient(180deg, #fdf6e6 0%, #f0e2c2 100%)",
                      boxShadow: "inset 0 0 0 1px rgba(140,100,60,0.25)",
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    {char.character}
                  </div>
                  <p className="mt-3 max-w-[8rem] text-sm leading-relaxed text-stone-600">
                    {char.meaning}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Brushstroke video — watch the name drawn stroke-by-stroke */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-14"
          >
            <NameBrushVideo chineseName={result.chineseName} />
          </motion.div>

          {/* Calligraphy styles showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <CalligraphyStyles chineseName={result.chineseName} />
          </motion.div>

          {/* Three explanation columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-14 grid gap-5 md:grid-cols-3"
          >
            <ExplainCard label="文化 Cultural" tone="red">
              <MarkdownText content={toStructuredMarkdown(result.culturalExplanation)} />
            </ExplainCard>
            <ExplainCard label="声 Sound Bridge" tone="amber">
              <MarkdownText content={toStructuredMarkdown(result.pronunciationMapping)} />
            </ExplainCard>
            <ExplainCard label="五行 Element" tone="ink">
              <MarkdownText content={toStructuredMarkdown(result.elementAnalysis)} />
            </ExplainCard>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-12 border-t border-stone-200/80 pt-8"
          >
            <p className="text-center text-sm text-stone-500">
              Save it as a calligraphy card, or share it with a friend who&apos;ll
              love it.
            </p>
            <div className="mx-auto mt-5 flex max-w-md gap-3">
              <Button
                className="h-11 flex-1 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                  boxShadow: "0 14px 40px -16px rgba(162, 36, 25, 0.55)",
                }}
                onClick={() =>
                  document
                    .getElementById("premium-upgrade")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Save as Card
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-full border-stone-300 px-5 text-stone-700 hover:bg-stone-100"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-stone-400">
              {shareCopied ? "Copied to clipboard" : "Tap share to copy a beautiful blurb"}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <FeedbackWidget chineseName={result.chineseName} />

      <PremiumUnlock
        chineseName={result.chineseName}
        pinyin={result.pinyin}
        meaning={result.meaning}
      />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs text-stone-600">
      {children}
    </span>
  );
}

function ExplainCard({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "red" | "amber" | "ink";
  children: React.ReactNode;
}) {
  const toneStyles: Record<string, { swatch: string; label: string }> = {
    red: { swatch: "#a32419", label: "text-[#a32419]" },
    amber: { swatch: "#b8860b", label: "text-[#a8770a]" },
    ink: { swatch: "#3a2a1f", label: "text-stone-700" },
  };
  const style = toneStyles[tone];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: style.swatch }}
        />
        <h3 className={`text-xs font-semibold uppercase tracking-[0.18em] ${style.label}`}>
          {label}
        </h3>
      </div>
      <div className="text-sm leading-relaxed text-stone-600">{children}</div>
    </div>
  );
}

function ResultSeal({ text }: { text: string }) {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" aria-hidden>
      <defs>
        <filter id="sealNoise2">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="6" />
          <feDisplacementMap in="SourceGraphic" scale="1.4" />
        </filter>
      </defs>
      <g filter="url(#sealNoise2)">
        <rect
          x="3"
          y="3"
          width="62"
          height="62"
          rx="3"
          fill="#b9251f"
          stroke="#7e1810"
          strokeWidth="2"
        />
        <text
          x="34"
          y="46"
          textAnchor="middle"
          fontSize="36"
          fontWeight="700"
          fill="#fbf2e2"
          fontFamily="'Noto Serif SC', serif"
        >
          {text}
        </text>
      </g>
    </svg>
  );
}
