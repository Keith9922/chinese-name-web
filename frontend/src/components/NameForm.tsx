"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Gift, BookOpen } from "lucide-react";
import { slideUp, buttonHover, buttonTap, scaleIn, staggerItem } from "@/lib/animations";
import NameResult from "./NameResult";

interface NameResultData {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
  suggestedCharacters: {
    character: string;
    meaning: string;
  }[];
}

interface FloatingLabelProps {
  label: string;
  htmlFor: string;
  focused: boolean;
  hasValue: boolean;
}

function FloatingLabel({ label, htmlFor, focused, hasValue }: FloatingLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        absolute left-4 transition-all duration-300 pointer-events-none z-10
        ${focused || hasValue
          ? "-top-2.5 text-xs px-2 bg-zinc-900/95 text-amber-400"
          : "top-4 text-sm text-zinc-500"
        }
      `}
    >
      {label}
    </label>
  );
}

function InputDecorations() {
  return (
    <>
      {/* Top left decoration */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-500/30 rounded-tl-xl" />
      {/* Top right decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-500/30 rounded-tr-xl" />
      {/* Bottom left decoration */}
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-500/30 rounded-bl-xl" />
      {/* Bottom right decoration */}
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-500/30 rounded-br-xl" />
    </>
  );
}

export default function NameForm() {
  const [englishName, setEnglishName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("other");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<NameResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/generate-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          englishName,
          gender,
          birthDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate name");
      }

      const data: NameResultData = await response.json();
      setResult(data);
    } catch {
      setError("Sorry, we couldn't generate a name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setEnglishName("");
    setGender("other");
    setBirthDate("");
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative">
        {/* Outer glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-3xl opacity-50"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.4), rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.4))",
            filter: "blur(20px)",
          }}
        />

        {/* Glassmorphism Card */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient border effect */}
          <div
            className="absolute inset-0 rounded-3xl p-[1px]"
            style={{
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.5), rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.5))",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "destination-out",
            }}
          />

          {/* Card background */}
          <div className="relative bg-zinc-950/90 backdrop-blur-xl">
            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative p-8 md:p-10">
              {/* Header with decorative elements */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-10"
              >
                {/* Decorative symbol */}
                <motion.div
                  className="inline-flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(245, 158, 11, 0.1))",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <span className="text-3xl">&#38518;</span>
                    </div>
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        animationDuration: "3s",
                      }}
                    />
                  </div>
                </motion.div>

                <h2 className="text-lg md:text-xl font-light text-zinc-400 mb-1 tracking-wide">
                  Reveal Your
                </h2>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 bg-clip-text text-transparent tracking-tight">
                  Chinese Name
                </h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-zinc-500 mt-3 max-w-xs mx-auto"
                >
                  Discover the name that carries thousand years of wisdom and cultural heritage
                </motion.p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
                  },
                }}
              >
                {/* Name Input with Floating Label */}
                <motion.div variants={staggerItem} className="relative pt-2">
                  <FloatingLabel
                    label="Your Current Name"
                    htmlFor="englishName"
                    focused={focusedField === "englishName"}
                    hasValue={englishName.length > 0}
                  />
                  <Input
                    id="englishName"
                    placeholder=""
                    value={englishName}
                    onChange={(e) => setEnglishName(e.target.value)}
                    onFocus={() => setFocusedField("englishName")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="h-14 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl pl-4 pt-5 transition-all duration-300"
                  />
                  <InputDecorations />
                </motion.div>

                {/* Gender Select with Floating Label */}
                <motion.div variants={staggerItem} className="relative pt-2">
                  <label
                    className={`
                      absolute left-4 transition-all duration-300 pointer-events-none z-10
                      ${focusedField === "gender" || gender !== "other"
                        ? "-top-2.5 text-xs px-2 bg-zinc-900/95 text-amber-400"
                        : "top-4 text-sm text-zinc-500"
                      }
                    `}
                  >
                    Gender
                  </label>
                  <Select
                    value={gender}
                    onValueChange={(value) => setGender(value as "male" | "female" | "other")}
                    onOpenChange={(open) => !open && setFocusedField(null)}
                  >
                    <SelectTrigger
                      onFocus={() => setFocusedField("gender")}
                      className="h-14 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl pl-4 pt-4 transition-all duration-300 data-[placeholder:text-zinc-600]"
                    >
                      <SelectValue placeholder=" " />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="male" className="focus:bg-zinc-800 focus:text-zinc-100">
                        Male
                      </SelectItem>
                      <SelectItem value="female" className="focus:bg-zinc-800 focus:text-zinc-100">
                        Female
                      </SelectItem>
                      <SelectItem value="other" className="focus:bg-zinc-800 focus:text-zinc-100">
                        Other / Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <InputDecorations />
                </motion.div>

                {/* Birth Date with Floating Label */}
                <motion.div variants={staggerItem} className="relative pt-2">
                  <FloatingLabel
                    label="Birth Date"
                    htmlFor="birthDate"
                    focused={focusedField === "birthDate"}
                    hasValue={birthDate.length > 0}
                  />
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    onFocus={() => setFocusedField("birthDate")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="h-14 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl pl-4 pt-4 transition-all duration-300 [color-scheme:dark]"
                  />
                  <InputDecorations />
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="text-sm text-red-400 text-center py-2 px-4 bg-red-500/10 rounded-lg border border-red-500/20"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  whileHover={!loading ? buttonHover : undefined}
                  whileTap={!loading ? buttonTap : undefined}
                  variants={staggerItem}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-base font-medium bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:via-red-500 hover:to-amber-500 text-white border-0 rounded-xl transition-all duration-300 disabled:opacity-70 relative overflow-hidden group"
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    />

                    {loading ? (
                      <span className="flex items-center gap-2 relative z-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Revealing your name...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 relative z-10">
                        <Sparkles className="w-5 h-5" />
                        <span>Discover My Chinese Name</span>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.form>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex justify-center gap-6 text-xs"
              >
                <span className="flex items-center gap-2 text-zinc-500">
                  <Gift className="w-4 h-4 text-amber-500/70" />
                  <span>100% Free</span>
                </span>
                <span className="flex items-center gap-2 text-zinc-500">
                  <Sparkles className="w-4 h-4 text-amber-500/70" />
                  <span>Instant</span>
                </span>
                <span className="flex items-center gap-2 text-zinc-500">
                  <BookOpen className="w-4 h-4 text-amber-500/70" />
                  <span>Culturally Rich</span>
                </span>
              </motion.div>

              {/* Decorative bottom line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <NameResult key="result" result={result} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Try Again Button */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={resetForm}
              variant="ghost"
              className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-300"
            >
              Generate Another Name
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
