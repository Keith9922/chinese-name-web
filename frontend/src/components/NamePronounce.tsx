"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";

interface Props {
  chineseName: string;
  pinyin: string;
  gender?: "male" | "female" | "other";
  meaning?: string;
  culturalExplanation?: string;
}

type State = "idle" | "playing" | "unsupported";

/**
 * Plays the Chinese name out loud using the browser's built-in
 * `window.speechSynthesis`. Picks the best zh-CN voice available, prefers
 * a female voice for "female"/"other" and a male voice for "male".
 *
 * Why not server-side TTS: free, no API budget, no latency, and modern
 * macOS/Windows/Android voices for Mandarin are surprisingly good.
 */
export default function NamePronounce({
  chineseName,
  pinyin,
  gender,
  meaning,
  culturalExplanation,
}: Props) {
  const [state, setState] = useState<State>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setState("unsupported");
      return;
    }
    // Some browsers populate voices asynchronously; warm them up
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
    };
  }, []);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const zh = voices.filter((v) => /^zh(-|_)/i.test(v.lang) || /Chinese|中文|Mandarin/i.test(v.name));
    if (!zh.length) return null;

    const wantMale = gender === "male";
    const preferences = wantMale
      ? [
          /^Microsoft\s+(Yunyang|Kangkang|Hanhan)/i,
          /Yunyang|Kangkang/i,
          /Male/i,
        ]
      : [
          /Tingting|Mei-Jia|Yating|Sin-Ji|Lili|Xiaoxiao|Yaoyao/i,
          /^Microsoft\s+(Xiaoxiao|Huihui|Yaoyao)/i,
          /Female/i,
        ];

    for (const pat of preferences) {
      const found = zh.find((v) => pat.test(v.name));
      if (found) return found;
    }
    // First zh-CN voice as fallback
    return zh.find((v) => /^zh-CN/i.test(v.lang)) ?? zh[0];
  };

  const togglePlay = () => {
    if (state === "unsupported") return;
    const synth = window.speechSynthesis;
    if (state === "playing") {
      synth.cancel();
      setState("idle");
      return;
    }
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(chineseName);
    const voice = pickVoice();
    if (voice) utt.voice = voice;
    utt.lang = voice?.lang ?? "zh-CN";
    utt.rate = 0.78;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    utt.onend = () => setState("idle");
    utt.onerror = () => setState("idle");
    utteranceRef.current = utt;
    setState("playing");
    synth.speak(utt);
  };

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {state !== "unsupported" && (
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label={state === "playing" ? "Pause pronunciation" : "Play pronunciation"}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex h-11 items-center gap-2.5 rounded-full border border-stone-300/80 bg-white/80 pl-3 pr-5 text-sm text-stone-700 backdrop-blur transition-all duration-300 hover:border-amber-400 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.35)]"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-white"
              style={{
                background:
                  "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
              }}
            >
              {state === "playing" ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 translate-x-[1px]" />
              )}
            </span>
            <span className="font-medium tracking-tight">
              {state === "playing" ? "Listening" : "Hear your name"}
            </span>
            {state === "playing" && <SoundWaves />}
          </motion.button>
        )}

        <AiAudioButton
          mode="pronunciation"
          label="Hear it spoken"
          chineseName={chineseName}
          pinyin={pinyin}
        />

        {meaning && culturalExplanation && (
          <AiAudioButton
            mode="narration"
            label="Hear the meaning"
            chineseName={chineseName}
            pinyin={pinyin}
            meaning={meaning}
            culturalExplanation={culturalExplanation}
          />
        )}
      </div>
    </div>
  );
}

type AiAudioState = "idle" | "loading" | "playing" | "paused" | "failed";

interface AiAudioButtonProps {
  mode: "pronunciation" | "narration";
  label: string;
  chineseName: string;
  pinyin: string;
  meaning?: string;
  culturalExplanation?: string;
}

/**
 * Fetches a real GMI Cloud TTS clip on first click (pronunciation or a
 * spoken meaning narration) and plays it back with a plain <audio> element.
 * Never shows a broken/error state to the end user — on any failure it
 * quietly disappears, leaving the rest of the page (including the free
 * browser-speech button above) fully functional.
 */
function AiAudioButton({
  mode,
  label,
  chineseName,
  pinyin,
  meaning,
  culturalExplanation,
}: AiAudioButtonProps) {
  const [state, setAiState] = useState<AiAudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (state === "failed") return null;

  const handleClick = async () => {
    if (state === "loading") return;

    // Already fetched — just toggle play/pause on the existing element.
    if (audioRef.current && audioUrlRef.current) {
      if (state === "playing") {
        audioRef.current.pause();
        setAiState("paused");
      } else {
        try {
          await audioRef.current.play();
          setAiState("playing");
        } catch {
          setAiState("failed");
        }
      }
      return;
    }

    setAiState("loading");
    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chineseName,
          pinyin,
          mode,
          meaning,
          culturalExplanation,
        }),
      });
      const data = (await res.json()) as { source?: string; audioUrl?: string };

      if (!res.ok || data.source !== "gmi" || !data.audioUrl) {
        setAiState("failed");
        return;
      }

      audioUrlRef.current = data.audioUrl;
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setAiState("paused");
      audio.onerror = () => setAiState("failed");
      audioRef.current = audio;

      await audio.play();
      setAiState("playing");
    } catch {
      setAiState("failed");
    }
  };

  const isPlaying = state === "playing";
  const isLoading = state === "loading";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      className="group relative inline-flex h-11 items-center gap-2.5 rounded-full border border-stone-300/80 bg-white/80 pl-3 pr-5 text-sm text-stone-700 backdrop-blur transition-all duration-300 hover:border-amber-400 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.35)] disabled:cursor-wait disabled:opacity-70"
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-full text-white"
        style={{
          background: "linear-gradient(135deg, #7e1810 0%, #c2392c 100%)",
        }}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="font-medium tracking-tight">
        {isLoading ? "Preparing…" : isPlaying ? "Listening" : label}
      </span>
      {isPlaying && <SoundWaves />}
    </motion.button>
  );
}

function SoundWaves() {
  return (
    <span aria-hidden className="ml-0.5 flex items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="block w-[2px] rounded-full bg-amber-600"
          animate={{ height: ["6px", "14px", "8px", "16px", "10px"] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
