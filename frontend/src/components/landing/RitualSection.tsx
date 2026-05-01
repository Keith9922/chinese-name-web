"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    seal: "一",
    label: "Listen",
    en: "Tell us your story",
    zh: "听其声",
    body: "Your English name, the year you were born, the season you arrived. Optionally the hour, if you know it.",
  },
  {
    seal: "二",
    label: "Compose",
    en: "Old wisdom meets new mind",
    zh: "察其象",
    body: "We pull surnames that match your sound, given-name characters that hold your meaning, and balance against your 八字 element profile.",
  },
  {
    seal: "三",
    label: "Brush",
    en: "Receive your name",
    zh: "成其名",
    body: "Three characters in calligraphy, with the meaning, the sound bridge, and the element story written out for you.",
  },
];

export default function RitualSection() {
  return (
    <section id="ritual" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
            起名之道 — The Ritual
          </span>
          <h2
            className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-stone-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Three steps,{" "}
            <span className="italic text-stone-500">five-thousand years</span> behind
            them.
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Vertical seal column */}
              <div className="mb-6 flex items-start gap-5">
                <div className="flex flex-col items-center">
                  <span
                    className="grid h-14 w-14 place-items-center rounded-md text-2xl font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #c2392c 0%, #8a1d15 100%)",
                      boxShadow: "0 6px 18px -8px rgba(162, 36, 25, 0.5)",
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    {step.seal}
                  </span>
                  <div className="mt-3 h-12 w-px bg-stone-300" />
                </div>

                <div className="flex-1">
                  <span
                    className="text-xs uppercase tracking-[0.25em] text-stone-500"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {step.label}
                  </span>
                  <h3
                    className="mt-2 text-2xl font-semibold leading-tight text-stone-900"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {step.en}
                  </h3>
                  <p
                    className="mt-1 text-sm tracking-[0.2em] text-stone-500"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {step.zh}
                  </p>
                </div>
              </div>

              <p className="text-[0.95rem] leading-relaxed text-stone-600">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
