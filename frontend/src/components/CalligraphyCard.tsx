"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, Heart } from "lucide-react";
import type { CardStyle } from "@/lib/pricing";

interface CalligraphyCardProps {
  chineseName: string;
  pinyin: string;
  meaning: string;
  style?: CardStyle;
  availableStyles?: CardStyle[];
  resolutionMultiplier?: number;
  planName?: string;
  resolutionLabel?: string;
}

type StyleOption = {
  id: CardStyle;
  label: string;
  description: string;
  preview: string;
};

const styleOptions: StyleOption[] = [
  {
    id: "classical",
    label: "Classical",
    description: "Traditional rice paper with red frame",
    preview: "rgba(245, 240, 230, 1)",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Dark elegance with gold accents",
    preview: "rgba(26, 26, 26, 1)",
  },
  {
    id: "seal",
    label: "Seal Script",
    description: "Ancient carved seal style",
    preview: "rgba(232, 220, 200, 1)",
  },
];

function generateCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  chineseName: string,
  pinyin: string,
  meaning: string,
  style: string,
  resolutionMultiplier: number
) {
  const scale = resolutionMultiplier;
  canvas.width = 600 * scale;
  canvas.height = 400 * scale;
  ctx.scale(scale, scale);

  const width = 600;
  const height = 400;

  // Background styles based on preference
  if (style === "classical") {
    // Rice paper texture effect
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, width, height);

    // Subtle texture
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.02})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Border - traditional red frame
    ctx.strokeStyle = "#8b2323";
    ctx.lineWidth = 8;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Inner gold line
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, width - 50, height - 50);
  } else if (style === "modern") {
    // Dark modern background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Gold gradient border
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#c9a227");
    gradient.addColorStop(0.5, "#f5d77a");
    gradient.addColorStop(1, "#c9a227");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  } else {
    // Seal script style - aged paper
    ctx.fillStyle = "#e8dcc8";
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = "#2d2d2d";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  }

  // Draw main Chinese characters
  ctx.font = `bold 120px "Noto Serif SC", "STKaiti", "KaiTi", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (style === "classical") {
    ctx.fillStyle = "#1a1a1a";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  } else if (style === "modern") {
    ctx.fillStyle = "#f5d77a";
    ctx.shadowColor = "rgba(245, 215, 122, 0.5)";
    ctx.shadowBlur = 20;
  } else {
    ctx.fillStyle = "#1a1a1a";
  }

  ctx.fillText(chineseName, width / 2, height / 2 - 30);

  // Reset shadow for other text
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Pinyin above the characters
  ctx.font = '24px "Noto Sans SC", sans-serif';
  ctx.fillStyle = style === "modern" ? "#a3a3a3" : "#666666";
  ctx.fillText(pinyin, width / 2, height / 2 - 90);

  // Meaning at the bottom
  ctx.font = '18px "Noto Sans SC", sans-serif';
  ctx.fillStyle = style === "modern" ? "#808080" : "#555555";
  const meaningLines = meaning.split("").reduce((acc: string[][], char, i) => {
    const line = Math.floor(i / 20);
    if (!acc[line]) acc[line] = [];
    acc[line].push(char);
    return acc;
  }, []);
  const meaningText = meaningLines.map((l) => l.join("")).join("\n");
  ctx.fillText(meaningText, width / 2, height / 2 + 100);

  // Decorative elements
  if (style === "classical") {
    // Small seal stamp effect in corner
    ctx.font = '16px "Noto Serif SC", serif';
    ctx.fillStyle = "#8b2323";
    ctx.fillText("中华命名", width - 50, height - 40);
  }
}

function StyleSelector({
  options,
  selectedStyle,
  onStyleChange,
}: {
  options: StyleOption[];
  selectedStyle: CardStyle;
  onStyleChange: (style: CardStyle) => void;
}) {
  return (
    <div className="flex justify-center gap-3 mb-6">
      {options.map((option) => (
        <motion.button
          key={option.id}
          onClick={() => onStyleChange(option.id)}
          className={`
            relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${selectedStyle === option.id
              ? "bg-gradient-to-r from-red-700 to-amber-600 text-white"
              : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {selectedStyle === option.id && (
            <motion.div
              layoutId="styleSelector"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-700 to-amber-600"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function CanvasWithFrame({
  canvasRef,
  style,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  style: string;
}) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-4 rounded-2xl blur-xl opacity-30"
        style={{
          background:
            style === "modern"
              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(220, 38, 38, 0.2))"
              : "linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(139, 35, 35, 0.2))",
        }}
      />

      {/* Frame */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(245, 158, 11, 0.1),
            inset 0 0 60px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-amber-500/50 z-10" />
        <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-amber-500/50 z-10" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-red-600/50 z-10" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-red-600/50 z-10" />

        <canvas
          ref={canvasRef}
          className="w-full max-w-[600px] block"
          style={{ imageRendering: "auto" }}
        />
      </div>
    </motion.div>
  );
}

export default function CalligraphyCard({
  chineseName,
  pinyin,
  meaning,
  style: initialStyle = "classical",
  availableStyles = ["classical", "modern", "seal"],
  resolutionMultiplier = 3,
  planName = "Calligraphy Card",
  resolutionLabel = "HD PNG",
}: CalligraphyCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleStyleOptions = styleOptions.filter((option) => availableStyles.includes(option.id));
  const [style, setStyle] = useState<CardStyle>(
    availableStyles.includes(initialStyle) ? initialStyle : availableStyles[0] ?? "classical"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGenerated = useRef(false);
  const effectiveStyle = availableStyles.includes(style) ? style : availableStyles[0] ?? "classical";

  useEffect(() => {
    if (!canvasRef.current || !chineseName || hasGenerated.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    hasGenerated.current = true;
    generateCanvas(canvas, ctx, chineseName, pinyin, meaning, effectiveStyle, resolutionMultiplier);
  }, [chineseName, effectiveStyle, pinyin, meaning, resolutionMultiplier]);

  const handleStyleChange = (newStyle: CardStyle) => {
    if (newStyle === effectiveStyle) return;
    setStyle(newStyle);
    hasGenerated.current = false;
    setIsGenerating(true);

    setTimeout(() => {
      if (!canvasRef.current || !chineseName) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      generateCanvas(canvas, ctx, chineseName, pinyin, meaning, newStyle, resolutionMultiplier);
      setIsGenerating(false);
    }, 300);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `chinese-name-${chineseName}-${effectiveStyle}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {planName}
        </motion.h2>
        <motion.p
          className="text-zinc-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {visibleStyleOptions.length > 1
            ? "Choose your favorite style and download your personalized artwork"
            : "Your curated premium artwork is ready to download"}
        </motion.p>
      </div>

      {/* Style selector */}
      {visibleStyleOptions.length > 1 ? (
        <StyleSelector
          options={visibleStyleOptions}
          selectedStyle={effectiveStyle}
          onStyleChange={handleStyleChange}
        />
      ) : (
        <div className="flex justify-center">
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
            Curated classical edition
          </div>
        </div>
      )}

      {/* Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveStyle}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <CanvasWithFrame canvasRef={canvasRef} style={effectiveStyle} />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 rounded-xl">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <motion.div
        className="flex justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleDownload}
          className="px-8 py-3 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white rounded-full font-medium hover:from-red-600 hover:via-red-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group relative overflow-hidden"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          />
          <Download className="w-5 h-5 relative z-10 group-hover:translate-y-0.5 transition-transform" />
          <span className="relative z-10">Download {resolutionLabel}</span>
        </motion.button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="text-center text-zinc-600 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="inline-flex items-center gap-1">
          <Heart className="w-3 h-3 text-red-500/50" />
          <span>Created with care for your Chinese name journey</span>
        </span>
      </motion.p>
    </motion.div>
  );
}
