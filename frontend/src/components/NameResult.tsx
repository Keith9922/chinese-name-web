"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Sparkles, Heart, BookOpen } from "lucide-react";

interface NameResultProps {
  result: {
    chineseName: string;
    pinyin: string;
    meaning: string;
    culturalExplanation: string;
    suggestedCharacters: { character: string; meaning: string }[];
  };
}

export default function NameResult({ result }: NameResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-amber-200 bg-white">
        {/* Top decorative gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, #b91c1c, #d97706, #b91c1c)",
          }}
        />

        <div className="relative p-8 md:p-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <p className="text-amber-600 text-sm uppercase tracking-widest mb-2">
              Your Chinese Name
            </p>

            {/* Main name display */}
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

            {/* Pinyin */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-stone-400 mt-4 font-light tracking-[0.15em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {result.pinyin}
            </motion.p>

            {/* Meaning tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-stone-500 mt-2 italic"
            >
              &ldquo;{result.meaning}&rdquo;
            </motion.p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            {/* Cultural Significance */}
            <Card className="p-5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-amber-700 text-sm font-medium mb-1">
                    Cultural Significance
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {result.culturalExplanation}
                  </p>
                </div>
              </div>
            </Card>

            {/* Character Breakdown */}
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

          {/* Premium CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-6 border-t border-stone-200"
          >
            <p className="text-center text-stone-500 text-sm mb-4">
              Unlock a beautiful calligraphy card to commemorate your Chinese name
            </p>

            <div className="flex gap-3">
              <Button className="flex-1 h-11 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white border-0 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                Calligraphy Card
              </Button>
              <Button
                variant="outline"
                className="h-11 border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-800 rounded-xl transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex justify-center gap-4 mt-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span>Made with care</span>
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>HD Quality</span>
              </span>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
