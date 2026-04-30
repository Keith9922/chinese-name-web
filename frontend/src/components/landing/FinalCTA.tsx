"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="relative px-4 py-32">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl px-8 py-20 text-center md:px-16"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #2a1a14 0%, #15110e 100%)",
          }}
        >
          {/* Faint character */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 select-none text-[26rem] font-bold leading-none text-white/[0.04]"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            名
          </span>

          {/* Top decorative dotted rule */}
          <div className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

          <span className="text-xs uppercase tracking-[0.4em] text-amber-300/80">
            一念之间 · One Thought Away
          </span>

          <h2
            className="relative mt-6 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.05] tracking-tight text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your Chinese name <br />
            is <span className="italic text-amber-200">already waiting.</span>
          </h2>

          <p className="relative mx-auto mt-6 max-w-md text-stone-300/80">
            We&apos;ll write it for you in about thirty seconds. Free to try, free to
            keep — and if you love it, the calligraphy card is yours for less than a
            cup of coffee.
          </p>

          <Link
            href="/generate"
            className="group relative mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-medium text-stone-900 transition-transform duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: "0 20px 50px -20px rgba(255, 230, 180, 0.5)" }}
          >
            <span>Begin the ritual</span>
            <span
              className="grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-xs text-white transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
