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
import { Loader2 } from "lucide-react";
import NameResult from "./NameResult";

export default function NameForm() {
  const [englishName, setEnglishName] = useState("");
  const [gender, setGender] = useState<"" | "male" | "female" | "other">("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [result, setResult] = useState<{
    chineseName: string;
    pinyin: string;
    meaning: string;
    culturalExplanation: string;
    pronunciationMapping: string;
    elementAnalysis: string;
    suggestedCharacters: { character: string; meaning: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!gender) throw new Error("Gender is required");

      const response = await fetch("/api/generate-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishName,
          gender,
          birthDate,
          birthTime: birthTime || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate name");

      const data = await response.json();
      setResult(data);
      // Smooth scroll to result after render
      window.setTimeout(() => {
        document.getElementById("name-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch {
      setError("Sorry, the brush slipped. Please try once more.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setEnglishName("");
    setGender("");
    setBirthDate("");
    setBirthTime("");
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)] backdrop-blur"
        >
          {/* Ornament: red corner ribbon */}
          <div
            aria-hidden
            className="absolute -left-10 -top-10 h-28 w-28 rotate-[-30deg] rounded-md"
            style={{
              background:
                "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
              boxShadow: "0 8px 24px -10px rgba(162, 36, 25, 0.4)",
            }}
          />
          <span
            aria-hidden
            className="absolute left-3 top-3 text-xs font-bold tracking-wide text-amber-100/95"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            起
          </span>

          <div className="relative px-7 pb-9 pt-10 md:px-10 md:pt-12">
            <div className="text-center">
              <span
                className="text-[10px] uppercase tracking-[0.4em] text-stone-500"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                The Naming Form
              </span>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Three answers, then the brush.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field label="Your name" hint="The one you go by today.">
                <Input
                  id="englishName"
                  placeholder="e.g. Emma Carter"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-stone-300 bg-stone-50/70 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                />
              </Field>

              <Field label="Gender" hint="Used to fit the name's tone.">
                <Select
                  value={gender}
                  onValueChange={(v) => setGender(v as "male" | "female" | "other")}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-stone-300 bg-stone-50/70 text-stone-900 focus:border-amber-500 focus:ring-amber-200">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    sideOffset={8}
                    alignItemWithTrigger={false}
                    className="border-stone-200 bg-white text-stone-800 shadow-lg"
                  >
                    <SelectItem value="male" className="focus:bg-stone-100 focus:text-stone-900">
                      Male
                    </SelectItem>
                    <SelectItem value="female" className="focus:bg-stone-100 focus:text-stone-900">
                      Female
                    </SelectItem>
                    <SelectItem value="other" className="focus:bg-stone-100 focus:text-stone-900">
                      Other / Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Birth date" hint="Sets your season &amp; element.">
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="h-12 rounded-xl border-stone-300 bg-stone-50/70 text-stone-900 focus:border-amber-500 focus:ring-amber-200 [color-scheme:light]"
                  />
                </Field>

                <Field label="Birth time" hint="Optional — sharpens the read." optional>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="h-12 rounded-xl border-stone-300 bg-stone-50/70 text-stone-900 focus:border-amber-500 focus:ring-amber-200 [color-scheme:light]"
                  />
                </Field>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="group h-12 w-full rounded-full text-base font-medium text-white shadow-lg transition-all duration-300 disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                  boxShadow: "0 14px 40px -16px rgba(162, 36, 25, 0.55)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Dipping the brush…</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    <span>Write my Chinese name</span>
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      →
                    </span>
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-stone-400">
                Free · no signup · ~30 seconds · we don&apos;t store your details
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            id="name-result"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-14 max-w-6xl"
          >
            <NameResult
              result={result}
              gender={gender || undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-6xl text-center"
          >
            <Button
              onClick={resetForm}
              variant="ghost"
              className="text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            >
              ↺ Write another name
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        {optional && (
          <span className="text-[11px] uppercase tracking-wider text-stone-400">
            optional
          </span>
        )}
      </div>
      {children}
      <p className="text-xs text-stone-500" dangerouslySetInnerHTML={{ __html: hint }} />
    </div>
  );
}
