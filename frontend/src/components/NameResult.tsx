"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Sparkles, Heart, BookOpen } from "lucide-react";
import MarkdownText from "./MarkdownText";
import PremiumUnlock from "./PremiumUnlock";

interface NameResultProps {
  result: {
    chineseName: string;
    pinyin: string;
    meaning: string;
    culturalExplanation: string;
    pronunciationMapping: string;
    elementAnalysis: string;
    suggestedCharacters: { character: string; meaning: string }[];
  };
}

export default function NameResult({ result }: NameResultProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const toStructuredMarkdown = (text: string) => {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "";
    }

    const sentences = normalized
      .split(/(?<=[.!?。])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      return normalized;
    }

    return sentences.map((sentence) => `- ${sentence}`).join("\n");
  };

  const handleShare = async () => {
    const shareText = `My Chinese name is ${result.chineseName} (${result.pinyin}) — ${result.meaning}.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Chinese Name",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      }
    } catch {
      // Ignore user cancellation or clipboard failures
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-amber-200 bg-white">
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: "linear-gradient(90deg, #b91c1c, #d97706, #b91c1c)",
            }}
          />

          <div className="relative p-8 md:p-10 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <p className="text-amber-600 text-sm uppercase tracking-widest mb-2">
                Your Chinese Name
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <h2
                  className="text-7xl md:text-8xl font-bold leading-none"
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    background: "linear-gradient(180deg, #292524 0%, #b91c1c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {result.chineseName}
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-stone-400 mt-4 font-light tracking-[0.15em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {result.pinyin}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-stone-500 mt-2 italic"
              >
                &ldquo;{result.meaning}&rdquo;
              </motion.p>

              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  Sound-matched
                </span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600">
                  Birth-profile tuned
                </span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600">
                  Keepsake-ready
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid gap-4 lg:grid-cols-3 mb-8"
            >
              <Card className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-700 text-sm font-medium mb-1">
                      Cultural Significance
                    </h3>
                    <MarkdownText content={toStructuredMarkdown(result.culturalExplanation)} />
                  </div>
                </div>
              </Card>

              <Card className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-700 text-sm font-medium mb-1">
                      Sound Bridge
                    </h3>
                    <MarkdownText content={toStructuredMarkdown(result.pronunciationMapping)} />
                  </div>
                </div>
              </Card>

              <Card className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-700 text-sm font-medium mb-1">
                      Element Balance
                    </h3>
                    <MarkdownText content={toStructuredMarkdown(result.elementAnalysis)} />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <Card className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                <h3 className="text-amber-700 text-sm font-medium mb-4 text-center">
                  Character Breakdown
                </h3>
                <div className="flex justify-center gap-12">
                  {result.suggestedCharacters.map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center"
                    >
                      <p
                        className="text-5xl md:text-6xl font-bold leading-none"
                        style={{
                          fontFamily: "'Noto Serif SC', serif",
                          background: "linear-gradient(180deg, #292524 0%, #57534e 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {char.character}
                      </p>
                      <p className="text-stone-500 text-xs mt-2 max-w-20">
                        {char.meaning}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-6 border-t border-stone-200"
            >
              <p className="text-center text-stone-500 text-sm mb-4">
                Save your result as a collectible card or share your new Chinese name now
              </p>

              <div className="flex gap-3 max-w-xl mx-auto">
                <Button
                  className="flex-1 h-11 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white border-0 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() =>
                    document
                      .getElementById("premium-upgrade")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save as Card
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-800 rounded-xl transition-all duration-300 px-4"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3 text-center text-xs text-stone-400">
                {shareCopied ? "Copied to clipboard" : "Share-ready text available in one tap"}
              </div>

              <div className="flex justify-center gap-4 mt-4 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>Made with care</span>
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Premium upgrades below</span>
                </span>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      <PremiumUnlock
        chineseName={result.chineseName}
        pinyin={result.pinyin}
        meaning={result.meaning}
      />
    </div>
  );
}
