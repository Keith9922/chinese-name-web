"use client";

const PAIRS = [
  { en: "Emma", zh: "苏雅琳" },
  { en: "Liam", zh: "黎安川" },
  { en: "Olivia", zh: "欧悠然" },
  { en: "Noah", zh: "诺一禾" },
  { en: "Ava", zh: "艾婉" },
  { en: "Mia", zh: "弥心" },
  { en: "Lucas", zh: "陆慕清" },
  { en: "Sophia", zh: "苏蘅" },
  { en: "Alex", zh: "艾澈" },
  { en: "Lily", zh: "黎清岚" },
  { en: "Henry", zh: "韩之书" },
  { en: "Chloe", zh: "柯落" },
  { en: "James", zh: "詹书行" },
  { en: "Maya", zh: "麦雅" },
  { en: "Theo", zh: "陶宁" },
];

/**
 * A continuous horizontal ticker of English → Chinese name pairs. The track
 * is duplicated once so the marquee can loop seamlessly via a single CSS
 * animation. No JS needed.
 */
export default function NameTickerMarquee() {
  const items = [...PAIRS, ...PAIRS];
  return (
    <section
      aria-label="Sample names"
      className="relative overflow-hidden border-y border-stone-200/70 bg-white/40 py-7 backdrop-blur"
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32"
        style={{ background: "linear-gradient(to right, #fbf6ee, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32"
        style={{ background: "linear-gradient(to left, #fbf6ee, transparent)" }}
      />

      <div className="ink-marquee-track flex w-max gap-12 whitespace-nowrap will-change-transform">
        {items.map((pair, i) => (
          <span key={i} className="flex items-baseline gap-3">
            <span
              className="text-[15px] italic text-stone-500"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {pair.en}
            </span>
            <span className="text-stone-300">→</span>
            <span
              className="text-2xl font-semibold tracking-tight text-stone-900"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {pair.zh}
            </span>
            <span className="ml-3 h-1.5 w-1.5 rounded-full bg-stone-300" />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ink-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ink-marquee-track {
          animation: ink-marquee 60s linear infinite;
        }
        .ink-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ink-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
