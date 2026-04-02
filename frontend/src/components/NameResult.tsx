"use client";

import { motion } from "framer-motion";
import { scaleIn, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Heart, BookOpen, Crown } from "lucide-react";

interface SuggestedCharacter {
  character: string;
  meaning: string;
}

interface NameResultData {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
  suggestedCharacters: SuggestedCharacter[];
}

function DecorativeCorner({ position }: { position: string }) {
  const rotationClass = {
    "top-left": "rotate-0",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "rotate-270",
  }[position];

  const positionClass = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  }[position];

  return (
    <div
      className={`absolute ${positionClass} w-12 h-12 ${rotationClass}`}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <path
          d="M0 0 L48 0 L48 8 L8 8 L8 48 L0 48 Z"
          fill="none"
          stroke="url(#cornerGradient)"
          strokeWidth="1.5"
        />
        <defs>
          <linearGradient id="cornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function NameCharacterDisplay({ name }: { name: string }) {
  return (
    <div className="relative inline-block">
      {/* Glow effect behind characters */}
      <motion.div
        className="absolute inset-0 blur-2xl"
        style={{
          background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main character display */}
      <motion.p
        className="relative text-7xl md:text-8xl font-bold leading-none"
        style={{
          fontFamily: "'Noto Serif SC', serif",
          background: "linear-gradient(180deg, #fef3c7 0%, #f59e0b 40%, #dc2626 80%, #991b1b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 30px rgba(245, 158, 11, 0.5))",
        }}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        {name}
      </motion.p>

      {/* Animated underline */}
      <motion.div
        className="absolute -bottom-3 left-0 right-0 h-0.5"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #f59e0b 20%, #dc2626 50%, #f59e0b 80%, transparent 100%)",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
          }}
        />
      </motion.div>

      {/* Sparkle decorations */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: i % 2 === 0 ? "-20px" : "calc(100% + 20px)",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

function CharacterBreakdownItem({ char, index }: { char: SuggestedCharacter; index: number }) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.4 + index * 0.15 }}
      className="text-center group"
    >
      {/* Character with hover effect */}
      <div className="relative">
        <motion.p
          className="text-5xl md:text-6xl font-bold leading-none transition-transform duration-300 group-hover:scale-110"
          style={{
            fontFamily: "'Noto Serif SC', serif",
            background: "linear-gradient(180deg, #fcd34d 0%, #f59e0b 50%, #dc2626 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 10px rgba(245, 158, 11, 0.3))",
          }}
        >
          {char.character}
        </motion.p>

        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.2) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </div>

      {/* Meaning */}
      <motion.p
        variants={staggerItem}
        className="text-zinc-500 text-xs mt-3 max-w-24 tracking-wide"
      >
        {char.meaning}
      </motion.p>
    </motion.div>
  );
}

function InfoCard({ title, content, icon: Icon, delay = 0 }: { title: string; content: string; icon: any; delay?: number }) {
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="relative group"
    >
      {/* Card background with gradient border */}
      <div
        className="relative p-5 rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))",
          border: "1px solid rgba(245, 158, 11, 0.1)",
        }}
      >
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(245, 158, 11, 0.05))",
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-amber-500/20 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-amber-500/20 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-red-500/20 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-red-500/20 rounded-br-lg" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-amber-500" />
            <h3 className="text-amber-400 text-sm uppercase tracking-wider font-medium">
              {title}
            </h3>
          </div>
          <p className="text-zinc-300 leading-relaxed text-sm">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function NameResult({ result }: NameResultProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg mx-auto mt-8"
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-30 blur-xl"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "linear-gradient(135deg, rgba(220, 38, 38, 0.4), rgba(245, 158, 11, 0.2))",
        }}
      />

      {/* Main Card */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Gradient border */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.5), rgba(220, 38, 38, 0.3), rgba(245, 158, 11, 0.5))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "destination-out",
          }}
        />

        {/* Card background */}
        <div
          className="relative py-8 px-6 md:py-10 md:px-8"
          style={{
            background: "linear-gradient(180deg, rgba(25, 25, 25, 0.98), rgba(15, 15, 15, 0.99))",
          }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm20 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 37a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm10-17h20v20H20V20zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative corners */}
          <DecorativeCorner position="top-left" />
          <DecorativeCorner position="top-right" />
          <DecorativeCorner position="bottom-right" />
          <DecorativeCorner position="bottom-left" />

          {/* Header */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            {/* Label */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
              <p className="text-amber-500/70 text-xs uppercase tracking-[0.2em]">
                Your Chinese Name
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
            </motion.div>

            {/* Main name display */}
            <NameCharacterDisplay name={result.chineseName} />

            {/* Pinyin */}
            <motion.p
              variants={staggerItem}
              className="text-xl text-zinc-400 mt-6 font-light tracking-[0.15em] italic"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {result.pinyin}
            </motion.p>

            {/* Meaning tagline */}
            <motion.p
              variants={staggerItem}
              className="text-sm text-zinc-500 mt-2"
            >
              &ldquo;{result.meaning}&rdquo;
            </motion.p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            className="space-y-4 mb-8"
          >
            <InfoCard
              title="Cultural Significance"
              content={result.culturalExplanation}
              icon={BookOpen}
              delay={0.2}
            />

            {/* Character Breakdown */}
            <motion.div
              variants={staggerItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="relative p-5 rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))",
                border: "1px solid rgba(245, 158, 11, 0.1)",
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-amber-500/20 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-amber-500/20 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-red-500/20 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-red-500/20 rounded-br-lg" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-amber-400 text-sm uppercase tracking-wider font-medium">
                    Character Breakdown
                  </h3>
                </div>

                <div className="flex justify-center gap-8 md:gap-12">
                  {result.suggestedCharacters.map((char, index) => (
                    <CharacterBreakdownItem
                      key={index}
                      char={char}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium CTA */}
          <motion.div
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            className="pt-6 border-t border-zinc-800/50"
          >
            <motion.p
              variants={staggerItem}
              className="text-center text-zinc-500 text-sm mb-4"
            >
              Unlock a beautiful calligraphy card to commemorate your Chinese name
            </motion.p>

            <div className="flex gap-3">
              <Button className="flex-1 h-12 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:via-red-500 hover:to-amber-500 text-white border-0 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group relative overflow-hidden">
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Calligraphy Card</span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-12 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              variants={staggerItem}
              className="flex justify-center gap-4 mt-4 text-xs text-zinc-600"
            >
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500/50" />
                <span>Made with care</span>
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 text-amber-500/50" />
                <span>HD Quality</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface NameResultProps {
  result: NameResultData;
}
