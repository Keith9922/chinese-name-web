"use client";

import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    char: "声",
    en: "Sound",
    body:
      "We listen to the music of your English name first. Soft openings (Sophia, Lily) want soft surnames; hard plosives (Kate, Mike) want bright tones.",
  },
  {
    char: "象",
    en: "Image",
    body:
      "Each character carries an image. 雅 is a swan in literature. 岚 is mountain mist. We choose two that paint a picture of who you are.",
  },
  {
    char: "数",
    en: "Numerology",
    body:
      "Your birth date sets a 八字 profile — a season, a Heavenly Stem, an Earthly Branch. We balance the missing element through character imagery.",
  },
  {
    char: "雅",
    en: "Taste",
    body:
      "We avoid the placeholder names — 李明, 王伟. A real Chinese friend wouldn’t name you that, and neither will we.",
  },
];

export default function StorySection() {
  return (
    <section id="story" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
          {/* Left — vertical title block */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:sticky md:top-32 md:self-start"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
              名之四道 — The Four Principles
            </span>
            <h2
              className="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-tight text-stone-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Why most generators
              <br />
              <span className="italic text-stone-500">just don’t feel right.</span>
            </h2>
            <p className="mt-5 max-w-md text-stone-600">
              Translation tools spell out your name letter-by-letter. The result is
              technically correct and emotionally empty. We work the way a Chinese
              parent would — by listening, watching, and balancing.
            </p>

            {/* Decorative big character */}
            <div
              aria-hidden
              className="pointer-events-none mt-10 hidden select-none text-[14rem] font-bold leading-none text-stone-200/80 md:block"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              名
            </div>
          </motion.div>

          {/* Right — principle list */}
          <div className="space-y-5">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.en}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="flex gap-6 rounded-2xl border border-stone-200/70 bg-white/60 p-7 backdrop-blur transition-all hover:border-stone-300 hover:bg-white/80"
              >
                <span
                  className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-md text-3xl font-bold text-stone-900"
                  style={{
                    background:
                      "linear-gradient(135deg, #f8ecd0 0%, #ecd9a8 100%)",
                    boxShadow: "inset 0 0 0 1px rgba(140, 100, 60, 0.18)",
                    fontFamily: "'Noto Serif SC', serif",
                  }}
                >
                  {p.char}
                </span>
                <div className="flex-1">
                  <h3
                    className="text-xl font-semibold tracking-tight text-stone-900"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {p.en}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-stone-600">
                    {p.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
