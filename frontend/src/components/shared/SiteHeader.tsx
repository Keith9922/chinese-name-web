"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SiteHeaderProps {
  variant?: "landing" | "app";
}

export default function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="flex items-center justify-between gap-4 rounded-full border border-stone-200/80 bg-white/75 px-3 py-2 pl-5 backdrop-blur-xl"
          style={{ boxShadow: "0 8px 32px -12px rgba(60, 38, 22, 0.12)" }}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-white shadow-sm transition-transform duration-500 group-hover:rotate-12"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              名
            </span>
            <span className="hidden text-base font-semibold tracking-tight text-stone-900 sm:inline">
              墨名 <span className="text-stone-400">·</span>{" "}
              <span className="text-stone-500" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                Ink Name
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "/#ritual", label: "The Ritual" },
              { href: "/#examples", label: "Examples" },
              { href: "/#pricing", label: "Pricing" },
              { href: "/#story", label: "Story" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Link
            href={variant === "app" ? "#name-form" : "/generate"}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
              boxShadow: "0 6px 20px -8px rgba(162, 36, 25, 0.6)",
            }}
          >
            <span className="relative">
              {variant === "app" ? "Begin" : "Find My Name"}
            </span>
            <span
              className="ml-0.5 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
