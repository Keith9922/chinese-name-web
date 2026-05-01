"use client";

import { motion } from "framer-motion";

const SHOWCASE = [
  {
    en: "Emma",
    zh: "苏雅琳",
    pinyin: "Sū Yǎ Lín",
    gloss: "the elegance of jade by the river",
    note: "Sū opens with the same softness as Emma; 雅琳 keeps her grace.",
  },
  {
    en: "Michael",
    zh: "麦瑞文",
    pinyin: "Mài Ruì Wén",
    gloss: "auspicious wheat; literary spirit",
    note: "Mài echoes Mike; Ruì-Wén lands the literary, capable feel.",
  },
  {
    en: "Lily",
    zh: "黎清岚",
    pinyin: "Lí Qīng Lán",
    gloss: "dawn-clear mountain mist",
    note: "Lí matches the L-sound; 清岚 paints lily-like clarity.",
  },
  {
    en: "James",
    zh: "詹书行",
    pinyin: "Zhān Shū Xíng",
    gloss: "the scholar who walks his own path",
    note: "Zhān echoes James; 书行 = literate and self-directed.",
  },
];

export default function NameShowcase() {
  return (
    <section id="examples" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
            真名 — Real Names
          </span>
          <h2
            className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-stone-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Not transliteration.{" "}
            <span className="italic text-stone-500">Translation of feeling.</span>
          </h2>
          <p className="mt-4 max-w-lg text-stone-600">
            We don&apos;t map letters to characters. We listen to the sound, the season,
            and the elements — and write a name that a Chinese friend would actually
            give you.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {SHOWCASE.map((item, idx) => (
            <ShowcaseCard key={item.en} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  item,
  idx,
}: {
  item: (typeof SHOWCASE)[number];
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/70 p-7 backdrop-blur transition-shadow duration-300 hover:shadow-xl"
    >
      {/* faint character watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-8 select-none text-[9rem] font-bold leading-none text-stone-200/60"
        style={{ fontFamily: "'Noto Serif SC', serif" }}
      >
        {item.zh[0]}
      </span>

      <div className="relative">
        <div className="flex items-baseline gap-3">
          <span
            className="text-stone-400"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            {item.en}
          </span>
          <span className="text-stone-300">→</span>
          <span
            className="text-3xl font-semibold text-stone-900"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            {item.zh}
          </span>
        </div>

        <p
          className="mt-2 text-sm tracking-[0.18em] text-stone-500"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {item.pinyin}
        </p>

        <p className="mt-5 text-[1rem] italic leading-relaxed text-stone-700">
          “{item.gloss}”
        </p>

        <div className="mt-5 border-t border-stone-200/80 pt-4">
          <p className="text-sm text-stone-500">{item.note}</p>
        </div>
      </div>
    </motion.div>
  );
}
