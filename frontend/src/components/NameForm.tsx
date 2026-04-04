"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Gift, BookOpen } from "lucide-react";
import NameResult from "./NameResult";

export default function NameForm() {
  const [englishName, setEnglishName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("other");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{
    chineseName: string;
    pinyin: string;
    meaning: string;
    culturalExplanation: string;
    suggestedCharacters: { character: string; meaning: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const data = await response.json();
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
    <div className="w-full max-w-lg mx-auto">
      <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-stone-200 bg-white">
        {/* Top decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, #b91c1c, #d97706, #b91c1c)",
          }}
        />

        <div className="relative p-8 md:p-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-lg md:text-xl font-light text-stone-500 mb-1 tracking-wide">
              Reveal Your
            </h2>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                background: "linear-gradient(135deg, #b91c1c, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Chinese Name
            </h2>
            <p className="text-sm text-stone-400 mt-3 max-w-xs mx-auto">
              Discover the name that carries thousand years of wisdom and cultural heritage
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="englishName"
                className="text-sm font-medium text-stone-600"
              >
                Your Current Name
              </label>
              <Input
                id="englishName"
                placeholder="John Smith"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                required
                className="h-12 bg-stone-50 border-stone-300 text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-100 rounded-xl transition-all duration-300"
              />
            </div>

            {/* Gender Select */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-stone-600"
              >
                Gender
              </label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as "male" | "female" | "other")}
              >
                <SelectTrigger className="h-12 bg-stone-50 border-stone-300 text-stone-800 focus:border-amber-400 focus:ring-amber-100 rounded-xl data-[placeholder:text-stone-400]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border-stone-200 text-stone-800">
                  <SelectItem value="male" className="focus:bg-stone-100 focus:text-stone-800">
                    Male
                  </SelectItem>
                  <SelectItem value="female" className="focus:bg-stone-100 focus:text-stone-800">
                    Female
                  </SelectItem>
                  <SelectItem value="other" className="focus:bg-stone-100 focus:text-stone-800">
                    Other / Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label
                htmlFor="birthDate"
                className="text-sm font-medium text-stone-600"
              >
                Birth Date
              </label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="h-12 bg-stone-50 border-stone-300 text-stone-800 focus:border-amber-400 focus:ring-amber-100 rounded-xl transition-all duration-300 [color-scheme:light]"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-600 text-center py-2 px-4 bg-red-50 rounded-lg border border-red-100"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white border-0 rounded-xl transition-all duration-300 disabled:opacity-70 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Revealing your name...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Discover My Chinese Name</span>
                </span>
              )}
            </Button>
          </form>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-center gap-6 text-xs"
          >
            <span className="flex items-center gap-1.5 text-stone-400">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>100% Free</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Culturally Rich</span>
            </span>
          </motion.div>
        </div>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <NameResult result={result} />
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
            className="mt-6 text-center"
          >
            <Button
              onClick={resetForm}
              variant="ghost"
              className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all duration-300"
            >
              Generate Another Name
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
