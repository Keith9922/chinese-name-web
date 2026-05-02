"use client";

import { motion } from "framer-motion";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import InkBackdrop from "@/components/shared/InkBackdrop";
import NameForm from "@/components/NameForm";

export default function GeneratePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbf6ee] text-stone-900">
      <InkBackdrop intensity="soft" />
      <SiteHeader variant="app" />

      <main className="relative pb-24 pt-32">
        <section className="relative px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
              起名 — Find Your Name
            </span>
            <h1
              className="mt-4 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-tight text-stone-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Tell us a little.{" "}
              <span className="italic text-stone-500">
                We&apos;ll write something true.
              </span>
            </h1>
            <p className="mt-5 text-stone-600">
              Three details — your name, your sign, the day you arrived. Add the
              hour if you know it; the elements will read more clearly.
            </p>
          </motion.div>
        </section>

        <section id="name-form" className="relative mt-12 px-4">
          <NameForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
