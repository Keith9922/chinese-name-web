"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Check, X } from "lucide-react";
import {
  INVITE_CODE_PATTERN,
  clearInviteCode,
  getStoredInviteCode,
  isValidInviteCode,
  setStoredInviteCode,
} from "@/lib/invite-code";

/**
 * "Have an invite code?" — a small inline field shown next to the
 * checkout buttons. Collapsed by default so the page stays clean for
 * paying visitors; expands to a single input with an Apply button.
 *
 * Backed by sessionStorage so the two checkout components (PremiumUnlock
 * and NameDownloads) stay in sync — type the code in either one and both
 * pick it up. Once "applied", the green confirmation persists across
 * page renders so the visitor knows the discount is locked in.
 */
export default function InviteCodeField({
  className = "",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getStoredInviteCode();
    if (stored) {
      setApplied(stored);
      setOpen(true);
    }
  }, []);

  const apply = () => {
    const trimmed = draft.trim().toUpperCase();
    if (!isValidInviteCode(trimmed)) {
      setError("Codes are 2–32 letters, digits, dashes, or underscores.");
      return;
    }
    setStoredInviteCode(trimmed);
    setApplied(trimmed);
    setDraft("");
    setError("");
  };

  const remove = () => {
    clearInviteCode();
    setApplied(null);
    setDraft("");
    setError("");
  };

  return (
    <div className={`text-left ${className}`}>
      {!open && !applied ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline"
        >
          <Ticket className="h-3.5 w-3.5" />
          Have an invite code?
        </button>
      ) : applied ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs text-emerald-800"
        >
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Invite code <span className="font-mono font-medium">{applied}</span> ready — applies at checkout
          </span>
          <button
            type="button"
            onClick={remove}
            aria-label="Remove invite code"
            className="ml-1 rounded-full p-0.5 text-emerald-600 transition-colors hover:bg-emerald-100"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder="Invite code"
              maxLength={32}
              pattern={INVITE_CODE_PATTERN.source}
              className="h-9 w-44 rounded-lg border border-stone-300 bg-white px-3 font-mono text-xs uppercase tracking-wide text-stone-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={apply}
              disabled={!draft.trim()}
              className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:border-amber-400 hover:text-amber-700 disabled:opacity-50"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDraft("");
                setError("");
              }}
              aria-label="Close invite code input"
              className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-[11px] text-red-600"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
