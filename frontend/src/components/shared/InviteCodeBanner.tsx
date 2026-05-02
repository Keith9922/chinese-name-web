"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import {
  captureInviteCodeFromUrl,
  clearInviteCode,
  getStoredInviteCode,
} from "@/lib/invite-code";

/**
 * Floating pill that appears whenever the visitor has an active invite
 * code. Picks up `?invite=`/`?code=` from the URL on mount, persists in
 * sessionStorage, and stays visible on every page until dismissed.
 *
 * Two reasons it stays visible: (1) the visitor is reassured the
 * discount will actually apply at checkout, (2) friction-free for the
 * sharer — they just paste their share link and the discount auto-flows.
 */
export default function InviteCodeBanner() {
  const [code, setCode] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Capture from URL (or read from sessionStorage if revisiting)
    const captured = captureInviteCodeFromUrl();
    setCode(captured ?? getStoredInviteCode());
  }, []);

  if (!code || hidden) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="invite-pill"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-[72px] left-1/2 z-40 -translate-x-1/2 px-3 sm:left-auto sm:right-6 sm:translate-x-0"
      >
        <div
          className="flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur"
          style={{
            background: "linear-gradient(135deg, rgba(254, 243, 199, 0.96), rgba(255, 250, 235, 0.96))",
            borderColor: "rgba(217, 119, 6, 0.45)",
            color: "#7c2d12",
            boxShadow: "0 12px 32px -16px rgba(162, 36, 25, 0.35)",
          }}
        >
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)" }}
          >
            <Gift className="h-3 w-3" />
          </span>
          <span className="font-medium tracking-tight">
            Invite code <span className="font-mono text-[13px]">{code}</span> applied
          </span>
          <span className="hidden text-xs text-amber-700/80 sm:inline">
            · checkout will be free
          </span>
          <button
            type="button"
            aria-label="Dismiss invite code"
            onClick={() => {
              clearInviteCode();
              setHidden(true);
            }}
            className="ml-1 grid h-5 w-5 place-items-center rounded-full text-amber-700/60 transition-colors hover:bg-amber-100 hover:text-amber-900"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
