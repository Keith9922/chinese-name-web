"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Stamp } from "lucide-react";
import { saveImageToCreation } from "@/lib/save-creation-image";

interface SealDesignProps {
  chineseName: string;
  creationId?: string;
}

interface GenerateSealResponse {
  source: "gmi" | "fallback";
  imageDataUrl?: string;
  error?: string;
}

type Status = "loading" | "ready" | "unavailable";

export default function SealDesign({ chineseName, creationId }: SealDesignProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!chineseName) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");
    setImageUrl(null);

    (async () => {
      try {
        const res = await fetch("/api/generate-seal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chineseName }),
        });
        const data = (await res.json()) as GenerateSealResponse;
        if (cancelled) return;

        if (res.ok && data.source === "gmi" && data.imageDataUrl) {
          setImageUrl(data.imageDataUrl);
          setStatus("ready");
          saveImageToCreation(creationId, "sealImageData", data.imageDataUrl);
        } else {
          setStatus("unavailable");
        }
      } catch (err) {
        console.error("[SealDesign] fetch failed:", err);
        if (!cancelled) setStatus("unavailable");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chineseName]);

  const handleDownload = () => {
    if (!imageUrl) return;
    // imageUrl is a data: URL (see seal-image.tsx), so a direct anchor
    // download works without any cross-origin fetch — same pattern as
    // CalligraphyCard's canvas.toDataURL() download.
    const link = document.createElement("a");
    link.download = `chinese-name-seal-${chineseName}.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleOrderSeal = () => {
    if (!imageUrl) return;
    // Same sessionStorage hand-off pattern as CalligraphyCard's "Print as
    // Wall Art" — the seal image is a large data URL, too big for a query
    // string. See src/app/order/page.tsx's fallback read.
    try {
      window.sessionStorage.setItem("inkname_order_image", imageUrl);
      window.sessionStorage.setItem("inkname_order_product", "carved_seal");
    } catch {
      // sessionStorage unavailable — /order will fall back to its
      // "generate first" placeholder rather than a broken navigation.
    }
    router.push("/order");
  };

  // A missing/failed seal should never break the page — render nothing.
  if (status === "unavailable") return null;

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.h3
          className="text-xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Personal Seal
        </motion.h3>
        <motion.p
          className="text-zinc-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          A carved-stone chop impression, engraved in traditional vermilion ink
        </motion.p>
      </div>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {status === "loading" ? (
            <motion.div
              key="loading"
              className="relative w-48 h-48 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(245, 240, 230, 0.9), rgba(232, 220, 200, 0.9))",
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(140,100,60,0.15)",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-red-700/70" />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Stamp className="w-16 h-16 text-red-800/20" />
              </motion.div>
              <span className="absolute -bottom-8 left-0 right-0 text-center text-xs text-zinc-500">
                Carving your seal&hellip;
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              className="relative"
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
            >
              {/* Outer glow, matching CalligraphyCard's frame treatment */}
              <div
                className="absolute -inset-3 rounded-2xl blur-xl opacity-30"
                style={{
                  background: "linear-gradient(135deg, rgba(220, 38, 38, 0.35), rgba(139, 35, 35, 0.2))",
                }}
              />
              <div
                className="relative w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "#ffffff",
                  boxShadow: `
                    0 20px 40px -12px rgba(0, 0, 0, 0.45),
                    0 0 0 1px rgba(245, 158, 11, 0.12)
                  `,
                }}
              >
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`Personal seal for ${chineseName}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "ready" && (
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={handleDownload}
            className="px-6 py-2.5 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white rounded-full text-sm font-medium hover:from-red-600 hover:via-red-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group relative overflow-hidden"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
            <Download className="w-4 h-4 relative z-10 group-hover:translate-y-0.5 transition-transform" />
            <span className="relative z-10">Download Seal</span>
          </motion.button>
          <motion.button
            onClick={handleOrderSeal}
            className="px-6 py-2.5 rounded-full border border-red-800/30 text-sm font-medium text-red-800 hover:bg-red-50 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Stamp className="w-4 h-4" />
            <span>Order a Carved Seal</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
