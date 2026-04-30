"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PRICING_PLANS } from "@/lib/pricing";

export default function PricingTeaser() {
  return (
    <section id="pricing" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
            润格 — Pricing
          </span>
          <h2
            className="mt-4 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.1] tracking-tight text-stone-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Free to discover.{" "}
            <span className="italic text-stone-500">Worth keeping in ink.</span>
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {PRICING_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "border-amber-300 bg-white shadow-[0_24px_60px_-24px_rgba(217,119,6,0.4)]"
                  : "border-stone-200 bg-white/70 backdrop-blur"
              }`}
            >
              {plan.badge && (
                <span
                  className="absolute right-5 top-5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <div className="flex items-baseline gap-2">
                <h3
                  className="text-xl font-semibold tracking-tight text-stone-900"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {plan.name}
                </h3>
              </div>
              <p className="mt-1 text-sm text-stone-500">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-stone-900">
                  {plan.priceLabel}
                </span>
                <span className="text-sm text-stone-400">
                  {plan.id === "free" ? "/ forever" : "/ one-time"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-stone-700"
                  >
                    <span
                      className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{
                        background:
                          plan.id === "free" ? "#a8a29e" : "#c2392c",
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/generate"
                className={`mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  plan.highlight
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : plan.id === "free"
                      ? "border border-stone-300 text-stone-700 hover:bg-stone-100"
                      : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                }`}
              >
                {plan.ctaLabel}
                <span aria-hidden>→</span>
              </Link>

              <div className="mt-3 text-[11px] uppercase tracking-wider text-stone-400">
                {plan.resolutionLabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
