"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ImageIcon, FileCode2, Film } from "lucide-react";
import { PAID_PLANS } from "@/lib/pricing";
import {
  applyInviteCodeToCheckoutUrl,
  getStoredInviteCode,
} from "@/lib/invite-code";
import InviteCodeField from "@/components/shared/InviteCodeField";

interface Props {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

const KEEPSAKE = PAID_PLANS.find((p) => p.id === "keepsake");
const SIGNATURE = PAID_PLANS.find((p) => p.id === "signature");

/**
 * The "what's in the box" preview block. Used to be raw download buttons
 * that gave the goods away for free, which made the paid tiers worthless.
 * Now it's a paywalled preview: the watermarked card image is shown
 * inline, the SVG / MP4 deliverables are presented as locked tiles, and
 * every CTA leads to the Gumroad checkout.
 */
export default function NameDownloads({
  chineseName,
  pinyin,
  meaning,
  classicalAllusion,
}: Props) {
  // Build preview URL — the route serves a watermarked, half-resolution
  // version when no `sig` query param is present.
  const previewParams = new URLSearchParams({
    name: chineseName,
    pinyin,
    meaning,
  });
  if (classicalAllusion) previewParams.set("allusion", classicalAllusion);
  const previewSrc = `/api/card?${previewParams.toString()}`;

  const goToCheckout = (planId: "keepsake" | "signature") => {
    const plan = planId === "keepsake" ? KEEPSAKE : SIGNATURE;
    if (!plan?.checkoutUrl) return;
    const url = new URL(plan.checkoutUrl);
    url.searchParams.set("chinese_name", chineseName);
    url.searchParams.set("pinyin", pinyin);
    url.searchParams.set("meaning", meaning);
    if (classicalAllusion) url.searchParams.set("classical_allusion", classicalAllusion);
    applyInviteCodeToCheckoutUrl(url, getStoredInviteCode());
    window.location.href = url.toString();
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-6 backdrop-blur md:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
            交付物 — What you take home
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Preview below is watermarked. Unlock the clean, downloadable versions with the Keepsake or Signature.
          </p>
        </div>
      </div>

      {/* Watermarked preview image */}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-stone-200">
        <PreviewCard src={previewSrc} alt={`${chineseName} calligraphy card preview`} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PaywalledTile
          icon={<ImageIcon className="h-4 w-4" />}
          title="HD calligraphy card"
          subtitle="2400 × 1600 PNG · clean, no watermark"
          included
          plan="Keepsake"
        />
        <PaywalledTile
          icon={<Film className="h-4 w-4" />}
          title="Brushstroke MP4"
          subtitle="Stroke-by-stroke video · TikTok-ready"
          plan="Signature"
        />
        <PaywalledTile
          icon={<FileCode2 className="h-4 w-4" />}
          title="Tattoo-ready SVG · horizontal"
          subtitle="Transparent vector · scales to any size"
          plan="Signature"
        />
        <PaywalledTile
          icon={<FileCode2 className="h-4 w-4" />}
          title="Tattoo-ready SVG · vertical"
          subtitle="Traditional column orientation"
          plan="Signature"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <InviteCodeField />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        {KEEPSAKE && (
          <motion.button
            type="button"
            onClick={() => goToCheckout("keepsake")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-stone-300 bg-white px-6 text-sm font-medium text-stone-800 transition-all hover:border-amber-400 hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.3)]"
          >
            Get Keepsake — {KEEPSAKE.priceLabel}
          </motion.button>
        )}
        {SIGNATURE && (
          <motion.button
            type="button"
            onClick={() => goToCheckout("signature")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-medium text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
              boxShadow: "0 14px 32px -14px rgba(162, 36, 25, 0.55)",
            }}
          >
            Get Signature — {SIGNATURE.priceLabel}
            <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </motion.button>
        )}
      </div>

      <p className="mt-5 text-center text-[11px] text-stone-400">
        Once you check out, the clean files arrive in your inbox within seconds.
      </p>
    </div>
  );
}

function PreviewCard({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full bg-gradient-to-b from-[#fdf6e6] to-[#f0e2c2]" style={{ aspectRatio: "3 / 2" }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-400">
          Rendering preview…
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

function PaywalledTile({
  icon,
  title,
  subtitle,
  plan,
  included,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  plan: "Keepsake" | "Signature";
  included?: boolean;
}) {
  const tone = plan === "Signature"
    ? "border-amber-200 bg-amber-50/60"
    : "border-stone-200 bg-white/70";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${tone}`}>
      <span
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-white"
        style={{ background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)" }}
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h4>
          <Lock className="h-3 w-3 text-stone-400" />
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{subtitle}</p>
        <p className="mt-2 text-[11px] uppercase tracking-wider text-amber-700/80">
          {included ? "Included in " : "Comes with the "}
          {plan}
        </p>
      </div>
    </div>
  );
}
