"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, FileCode2, Loader2 } from "lucide-react";

interface Props {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

type Pending = null | "card" | "svg-h" | "svg-v";

export default function NameDownloads({
  chineseName,
  pinyin,
  meaning,
  classicalAllusion,
}: Props) {
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState("");

  const downloadCard = async (style: "kaishu" | "brush" = "kaishu") => {
    if (pending) return;
    setPending("card");
    setError("");
    try {
      const params = new URLSearchParams({
        name: chineseName,
        pinyin,
        meaning,
        style,
      });
      if (classicalAllusion) params.set("allusion", classicalAllusion);
      const res = await fetch(`/api/card?${params.toString()}`);
      if (!res.ok) throw new Error(`Card render failed (${res.status})`);
      const blob = await res.blob();
      saveBlob(blob, `${chineseName}_calligraphy_card.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't render the card");
    } finally {
      setPending(null);
    }
  };

  const downloadSvg = async (orientation: "horizontal" | "vertical") => {
    if (pending) return;
    setPending(orientation === "vertical" ? "svg-v" : "svg-h");
    setError("");
    try {
      const params = new URLSearchParams({ name: chineseName, orientation });
      const res = await fetch(`/api/svg?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `SVG export failed (${res.status})`);
      }
      const blob = await res.blob();
      saveBlob(blob, `${chineseName}_tattoo_${orientation}.svg`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't export SVG");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-6 backdrop-blur md:p-8">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-700/80">
          下载 — Take it with you
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Three forms of your name, ready to keep.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DownloadTile
          icon={<ImageIcon className="h-4 w-4" />}
          title="HD calligraphy card"
          subtitle="2400 × 1600 PNG, framed and ready to print or post."
          loading={pending === "card"}
          onClick={() => downloadCard("kaishu")}
        />
        <DownloadTile
          icon={<FileCode2 className="h-4 w-4" />}
          title="Tattoo SVG · horizontal"
          subtitle="Transparent vector outline, scalable to any size."
          loading={pending === "svg-h"}
          onClick={() => downloadSvg("horizontal")}
        />
        <DownloadTile
          icon={<FileCode2 className="h-4 w-4" />}
          title="Tattoo SVG · vertical"
          subtitle="Traditional column orientation."
          loading={pending === "svg-v"}
          onClick={() => downloadSvg("vertical")}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="mt-4 text-[11px] text-stone-400">
        These previews are watermark-free for now while we test. Higher-resolution
        exports + the Signature Collection (3 styles, brushstroke MP4) coming via{" "}
        <a href="#premium-upgrade" className="text-amber-700 underline-offset-2 hover:underline">
          Stripe checkout
        </a>
        .
      </p>
    </div>
  );
}

function DownloadTile({
  icon,
  title,
  subtitle,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-start gap-2 rounded-xl border border-stone-200 bg-white/80 p-4 text-left transition-all duration-300 hover:border-amber-400 hover:shadow-[0_8px_24px_-12px_rgba(162,36,25,0.25)] disabled:opacity-60"
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="grid h-7 w-7 place-items-center rounded-md text-white"
          style={{ background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)" }}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
        </span>
        <Download
          className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${loading ? "opacity-30" : "group-hover:translate-y-0.5"}`}
        />
      </div>
      <h4 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h4>
      <p className="text-xs leading-relaxed text-stone-500">{subtitle}</p>
    </motion.button>
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
